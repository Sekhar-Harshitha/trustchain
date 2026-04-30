import os
import secrets
import random
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from dotenv import load_dotenv

from store.memory_store import AADHAAR_DB, sessions, otp_store, seed_fraud_user

load_dotenv()

auth_bp = Blueprint("auth", __name__)

def validate_aadhaar(aadhaar_str):
    if not isinstance(aadhaar_str, str):
        return False
    if len(aadhaar_str) != 12:
        return False
    if not aadhaar_str.isdigit():
        return False
    if aadhaar_str[0] in ['0', '1']:
        return False
    return True

def get_twilio_client():
    sid = os.getenv("TWILIO_ACCOUNT_SID")
    token = os.getenv("TWILIO_AUTH_TOKEN")
    if not sid or not token:
        return None
    try:
        return Client(sid, token)
    except Exception:
        return None

def mask_phone(phone):
    if not phone or len(phone) < 4:
        return phone
    return "X" * (len(phone) - 4) + phone[-4:]

def mask_aadhaar(aadhaar):
    if not aadhaar or len(aadhaar) != 12:
        return aadhaar
    return f"XXXX XXXX {aadhaar[-4:]}"

@auth_bp.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.get_json() or {}
    aadhaar = data.get("aadhaar", "").strip()
    
    if not validate_aadhaar(aadhaar):
        return jsonify({"success": False, "error": "Invalid Aadhaar number"}), 400
        
    if aadhaar not in AADHAAR_DB:
        return jsonify({"success": False, "error": "Aadhaar not found in system"}), 404
        
    phone = os.getenv("DEMO_PHONE_NUMBER")
    
    twilio_client = get_twilio_client()
    verify_sid = os.getenv("TWILIO_VERIFY_SERVICE_SID")
    
    if twilio_client and verify_sid and phone:
        try:
            verification = twilio_client.verify.v2.services(verify_sid).verifications.create(
                to=phone, channel="sms"
            )
            if verification.status == "pending":
                return jsonify({
                    "success": True, 
                    "message": "OTP sent", 
                    "masked_phone": mask_phone(phone),
                    "name": AADHAAR_DB[aadhaar]["name"], 
                    "state": AADHAAR_DB[aadhaar].get("state", ""),
                    "demo_mode": False
                }), 200
        except TwilioRestException as e:
            print(f"Twilio API Error [{e.code}]: {e.msg}")
            # Fall through to demo fallback
        except Exception as e:
            print(f"Unexpected Twilio error: {str(e)}")
            # Fall through to demo fallback
            
    # DEMO FALLBACK
    otp = str(random.randint(100000, 999999))
    expires = datetime.now() + timedelta(minutes=10)
    otp_store[aadhaar] = { "otp": otp, "expires": expires.isoformat() }
    
    print("\n╔" + "═" * 22 + "╗")
    print(f"║   DEMO OTP: {otp}   ║")
    print("╚" + "═" * 22 + "╝\n")
    
    return jsonify({
        "success": True, 
        "demo_mode": True, 
        "message": "Demo OTP printed to terminal",
        "masked_phone": mask_phone(phone) if phone else "UNKNOWN",
        "name": AADHAAR_DB[aadhaar]["name"],
        "state": AADHAAR_DB[aadhaar].get("state", "")
    }), 200

@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json() or {}
    aadhaar = data.get("aadhaar", "").strip()
    otp = str(data.get("otp", "")).strip()
    
    if not validate_aadhaar(aadhaar) or len(otp) != 6 or not otp.isdigit():
        return jsonify({"success": False, "error": "Invalid Aadhaar or OTP format"}), 400
        
    phone = os.getenv("DEMO_PHONE_NUMBER")
    
    twilio_client = get_twilio_client()
    verify_sid = os.getenv("TWILIO_VERIFY_SERVICE_SID")
    
    otp_verified = False
    
    if twilio_client and verify_sid and phone:
        try:
            check = twilio_client.verify.v2.services(verify_sid).verification_checks.create(
                to=phone, code=otp
            )
            if check.status == "approved":
                otp_verified = True
        except TwilioRestException as e:
            if e.code == 60202:
                return jsonify({"success": False, "error": "Maximum OTP attempts reached. Request a new OTP."}), 401
            elif e.code == 60203:
                return jsonify({"success": False, "error": "OTP has expired. Request a new one."}), 401
            else:
                print(f"Twilio Verify Error [{e.code}]: {e.msg}")
                # Fall through to demo fallback
        except Exception as e:
            print(f"Unexpected Twilio check error: {str(e)}")
            # Fall through to demo fallback
            
    # DEMO FALLBACK
    if not otp_verified:
        stored = otp_store.get(aadhaar)
        if stored and stored["otp"] == otp:
            expires_time = datetime.fromisoformat(stored["expires"])
            if datetime.now() < expires_time:
                otp_verified = True
            else:
                return jsonify({"success": False, "error": "OTP expired"}), 401
        else:
            return jsonify({"success": False, "error": "Invalid OTP"}), 401
            
    # CREATE SESSION
    token = secrets.token_hex(32)
    user_info = AADHAAR_DB.get(aadhaar, {})
    
    sessions[token] = {
        "aadhaar": aadhaar,
        "name": user_info.get("name"),
        "state": user_info.get("state"),
        "dob": user_info.get("dob", "Unknown"),
        "trust_score": 100,
        "total_orders": 0,
        "account_age_days": 30,
        "avg_narrative_score": 50
    }
    
    if aadhaar == "111122223333":
        try:
            seed_fraud_user(aadhaar)
        except Exception as e:
            print(f"Error seeding fraud user: {e}")
        
    # Clear otp_store
    if aadhaar in otp_store:
        del otp_store[aadhaar]
        
    return jsonify({
        "success": True,
        "token": token,
        "user": {
            "aadhaar": mask_aadhaar(aadhaar),
            "name": user_info.get("name"),
            "state": user_info.get("state"),
            "trust_score": 100
        }
    }), 200

@auth_bp.route("/me", methods=["GET"])
def get_me():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"success": False, "error": "Unauthorized"}), 401
        
    token = auth_header.split(" ")[1]
    
    user_data = sessions.get(token)
    if not user_data:
        return jsonify({"success": False, "error": "Session not found"}), 404
        
    return jsonify({"success": True, "user": user_data}), 200
