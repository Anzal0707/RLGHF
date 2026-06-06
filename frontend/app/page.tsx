"use client";







import { useEffect, useState, useRef, type CSSProperties } from "react";



import { motion, AnimatePresence, useReducedMotion } from "framer-motion";



import { apiClient, ApiError } from "./lib/apiClient";



import {
  getHospitalRated,
  setHospitalRatedPersisted,
  getRatedDepartments,
  addRatedDepartmentPersisted,
  isDailyRatingLimitError,
  loadDailyRatingState,
  getKathmanduDateString,
} from "./lib/ratingPersistence";



import { Home as HomeIcon, Send, MessageSquare, User, Building2, CheckCircle2 } from "lucide-react";

import HospitalRatingModal from "./components/HospitalRatingModal";
import HospitalRatingCard from "./components/HospitalRatingCard";
import type { HospitalRatingPayload } from "./components/HospitalRatingModal";
import ModalShell, { Z_MODAL_BACKDROP } from "./components/ModalShell";

const PORTAL_REVEAL_EASE = [0.22, 1, 0.36, 1] as const;







// Language Translations Data Structure



const translations = {



  en: {



    title: "Patient Feedback & Support Portal",



    subtitle: "RLG Eye Hospital - Committed to Your Vision and Care",



    introText: "Your feedback helps us serve you better. Submit your complaint, suggestion, or appreciation in under 1 minute. You can submit anonymously.",

    portalSubtitle1: "Help us shape better care for everyone.",
    portalSubtitle2:
      "Share your experience, concerns, or appreciation. Your submission is completely secure, confidential, and reviewed with care.",



    languageLabel: "Choose Language / भाषा छान्नुहोस् / भाषा चुनें",



    headerName: "Ramlal Golchha Eye Hospital Foundation",



    headerTagline: "Under the Management of Nepal Eye Program, Tilganga Institute of Ophthalmology",







    // Form fields



    ratingLabel: "How was your overall experience with our hospital services today?",



    ratingDescription: ["Select rating", "Terrible", "Bad", "Neutral", "Good", "Excellent"],



    haveComplaint: "Have Complaint?",



    ratingFeedbackLabel: "Optional feedback (tell us more)",



    ratingFeedbackPlaceholder: "Share your experience (optional)",



    sendRating: "Send Rating",



    rateOtherDepartment: "Rate Other Department",



    rateDepartments: "Rate Departments",



    ratedBadge: "Rated",



    dailyRatingLimit: "You have already submitted a rating for today. Please try again tomorrow.",







    locationLabel: "Give Feedback by Department",



    locationSelect: "Choose departments",







    descriptionLabel: "Describe your feedback / complaint",



    descriptionPlaceholder: "Describe what happened in detail. (e.g. staff behavior, billing delay, cleanliness issue, etc.)",







    voiceLabel: "Voice Complaint (Highly Recommended if typing is uncomfortable)",



    voiceRecordStart: "Record Voice",



    voiceRecordStop: "Stop Recording",



    voicePlaying: "Playing recording...",



    voiceDelete: "Delete audio",



    voiceMicPermission: "Please grant microphone permission to record audio.",



    voiceSupported: "Voice recording is active.",







    anonymousLabel: "Submit anonymously?",



    anonymousYes: "Yes, hide my identity",



    anonymousNo: "No, share my contact details",







    contactSection: "Complainant Contact Details",



    nameLabel: "Your Full Name",



    phoneLabel: "Phone / WhatsApp Number",



    phoneHelp: "We will send tracking updates via SMS/WhatsApp.",



    patientIdLabel: "Patient ID / EMR ID (Optional)",



    patientIdPlaceholder: "e.g. RLG-10023",



    chooseFilePlaceholder: "Choose file (Image, Video, PDF)...",







    indToggleLabel: "Complaint about a specific person",



    indNameLabel: "Name (if known)",



    indAppearanceLabel: "Appearance description (if name unknown)",



    indRoleLabel: "Position/Role",







    attachmentLabel: "Upload Photo/Document (Optional)",







    submitComplaint: "Department Complaint",



    btnSubmit: "Submit",



    btnIndividualComplaint: "Individual Complaint",

    selectComplaintType: "Select Complaint Type",
    departmentComplaint: "Department Complaint",
    departmentComplaintDesc: "Submit a complaint about a specific department or service",
    individualComplaint: "Individual Complaint",
    individualComplaintDesc: "Submit a complaint about a specific person or staff member",

    btnSubmitting: "Submitting securely...",



    validationError: "Please provide a written description or upload a voice recording.",

    indRequiredFieldsError: "Please complete all required fields before submitting your complaint.",

    contactValidationError: "Please provide your name or phone number when submitting non-anonymously.",







    // Success View



    successTitle: "Complaint Successfully Submitted",



    successText: "Thank you for sharing your experience. We take every complaint seriously and will investigate immediately.",



    ticketLabel: "Your Unique Ticket ID",



    ticketHelp: "Your concern is noted. Appropriate action will be taken shortly. Please note or screenshot this ticket ID for reference.",



    phonePlaceholder: "10 Digits (e.g. 98XXXXXXXX)",



    btnNew: "Submit Another Response",



    ratingSuccessTitle: "Thank you for your rating!",



    ratingSuccessText: "Your feedback helps us improve patient care.",



    welcomeText: "Welcome to Ram Lal Golchha Eye Hospital Foundation",



    btnHome: "Return to Home",







    // Categories list



    categories: {



      DOCTOR: "Doctor behavior",



      STAFF: "Staff behavior",



      WAITING: "Long waiting time",



      BILLING: "Billing / Refund issue",



      CLEANLINESS: "Cleanliness & Hygiene",



      PHARMACY: "Pharmacy / Medicine queue",



      OPTICAL: "Optical shop / Glasses",



      SURGERY: "Surgery process / Delay",



      CAMP: "Outreach camp services",



      CANTEEN: "Food / Canteen",



      COMMUNICATION: "Communication / Misinformation",



      SUGGESTION: "Suggestion or Appreciation",



      EMERGENCY_COMPLAINT: "Emergency issue",



      OTHER: "Other issue"



    },







    // Locations list



    locations: {



      OPD: "OPD (Outpatient Department)",



      IPD: "Ward / Inpatient Department",



      Pharmacy: "Pharmacy counter",



      Optical: "Optical Refraction",



      Billing: "Billing / Cash counter",



      OT: "Operation Theater (OT) area",



      Canteen: "Hospital Canteen",



      "Lab & Diagnostics": "Laboratory & Diagnostics",



      Reception: "Reception / Help desk",



      Other: "Other location"



    }



  },



  ne: {



    title: "बिरामी प्रतिक्रिया तथा गुनासो पोर्टल",



    subtitle: "आर.एल.जी. आँखा अस्पताल - तपाईंको दृष्टि र सेवाप्रति प्रतिबद्ध",



    introText: "तपाईंको अमूल्य प्रतिक्रियाले हामीलाई अझ राम्रो सेवा दिन मद्दत गर्दछ। आफ्नो गुनासो, सुझाव वा प्रशंसा १ मिनेट भित्रै दर्ता गर्नुहोस्। तपाईंले नाम गोप्य राखेर पनि गुनासो बुझाउन सक्नुहुन्छ।",

    portalSubtitle1: "सबैका लागि अझ राम्रो स्वास्थ्य सेवा सुनिश्चित गर्न हामीलाई मद्दत गर्नुहोस्।",
    portalSubtitle2:
      "आफ्ना अनुभव, गुनासो वा प्रशंसा साझा गर्नुहोस्। तपाईंले पठाउनुभएको विवरण पूर्ण रूपमा सुरक्षित, गोप्य रहनेछ र यसलाई गम्भीरताका साथ हेरिनेछ।",



    languageLabel: "भाषा छान्नुहोस्",



    headerName: "Ramlal Golchha Eye Hospital Foundation",



    headerTagline: "Under the Management of Nepal Eye Program, Tilganga Institute of Ophthalmology",







    ratingLabel: "समग्रमा हाम्रो अस्पतालको सेवा तपाईंलाई आज कस्तो लाग्यो?",



    ratingDescription: ["मूल्याङ्कन", "धेरै खराब", "खराब", "सामान्य", "राम्रो", "उत्कृष्ट"],



    haveComplaint: "गुनासो छ?",



    ratingFeedbackLabel: "वैकल्पिक प्रतिक्रिया (थप भन्नुहोस्)",



    ratingFeedbackPlaceholder: "आफ्नो अनुभव साझा गर्नुहोस् (वैकल्पिक)",



    sendRating: "मूल्याङ्कन पठाउनुहोस्",



    rateOtherDepartment: "अर्को विभाग मूल्याङ्कन गर्नुहोस्",



    rateDepartments: "विभागहरू मूल्याङ्कन गर्नुहोस्",



    ratedBadge: "मूल्याङ्कन भयो",



    dailyRatingLimit: "आजको लागि मूल्याङ्कन पहिले नै पठाइसक्नुभएको छ। कृपया भोलि फेरि प्रयास गर्नुहोस्।",







    locationLabel: "विभाग अनुसार प्रतिक्रिया दिनुहोस्",



    locationSelect: "विभाग छान्नुहोस्",







    descriptionLabel: "गुनासो वा प्रतिक्रियाको विवरण लेख्नुहोस्",



    descriptionPlaceholder: "के भएको थियो विस्तृत विवरण लेख्नुहोस् (उदा: कर्मचारीको व्यवहार, पैसा तिर्दा ढिलाइ आदि)।",







    voiceLabel: "आवाज रेकर्ड गर्नुहोस् (यदि टाइप गर्न गाह्रो भएमा)",



    voiceRecordStart: "रेकर्ड सुरु गर्नुहोस्",



    voiceRecordStop: "रेकर्ड बन्द गर्नुहोस्",



    voicePlaying: "आवाज बज्दैछ...",



    voiceDelete: "हटाउनुहोस्",



    voiceMicPermission: "कृपया आवाज रेकर्ड गर्नको लागि माइक अनुमति दिनुहोस्।",



    voiceSupported: "आवाज रेकर्ड प्रणाली उपलब्ध छ।",







    anonymousLabel: "गोप्य रूपमा बुझाउने?",



    anonymousYes: "हो, मेरो विवरण गोप्य राख्नुहोस्",



    anonymousNo: "होइन, मेरो सम्पर्क विवरण देखाउनुहोस्",







    contactSection: "गुनासोकर्ताको सम्पर्क विवरण",



    nameLabel: "तपाईंको पूरा नाम",



    phoneLabel: "फोन / व्हाट्सएप नम्बर",



    phoneHelp: "हामी यस नम्बरमा गुनासो सम्बन्धी अपडेटहरू पठाउनेछौं।",



    patientIdLabel: "बिरामी आईडी / EMR ID (ऐच्छिक)",



    patientIdPlaceholder: "उदाहरण: RLG-10023",



    chooseFilePlaceholder: "फाइल छान्नुहोस् (तस्वीर, भिडियो, PDF)...",







    indToggleLabel: "कुनै विशेष व्यक्तिको बारेमा गुनासो",



    indNameLabel: "नाम (थाहा भएमा)",



    indAppearanceLabel: "शारीरिक बनावट वा हुलिया (नाम थाहा नभएमा)",



    indRoleLabel: "पद / जिम्मेवारी",







    attachmentLabel: "फोटो वा कागजपत्र अपलोड गर्नुहोस् (ऐच्छिक)",







    submitComplaint: "विभागीय गुनासो",



    btnSubmit: "पेश गर्नुहोस्",



    btnIndividualComplaint: "व्यक्तिगत गुनासो",

    selectComplaintType: "गुनासो प्रकार छान्नुहोस्",
    departmentComplaint: "विभागीय गुनासो",
    departmentComplaintDesc: "कुनै विशेष विभाग वा सेवा बारे गुनासो दर्ता गर्नुहोस्",
    individualComplaint: "व्यक्तिगत गुनासो",
    individualComplaintDesc: "कुनै विशेष व्यक्ति वा कर्मचारी बारे गुनासो दर्ता गर्नुहोस्",

    btnSubmitting: "सुरक्षित रूपमा दर्ता हुँदैछ...",



    validationError: "कृपया अनिवार्य क्षेत्र भर्नुहोस्: विवरण (वा आवाज रेकर्ड गर्नुहोस्)।",

    indRequiredFieldsError: "कृपया गुनासो पेश गर्नु अघि सबै अनिवार्य क्षेत्रहरू भर्नुहोस्।",

    contactValidationError: "गोप्य नराखेर पेश गर्दा कृपया आफ्नो नाम वा फोन नम्बर दिनुहोस्।",







    successTitle: "गुनासो सफलतापूर्वक दर्ता भयो",



    successText: "आफ्नो अनुभव साझा गर्नुभएकोमा धन्यवाद। हामी हरेक गुनासोलाई गम्भीरतापूर्वक लिन्छौं र तुरुन्तै अनुसन्धान गर्नेछौं।",



    ticketLabel: "तपाईंको टिकट नम्बर (Ticket ID)",



    ticketHelp: "तपाईंको गुनासो दर्ता भएको छ। छिट्टै उचित कदम चालिनेछ। कृपया सन्दर्भको लागि यो टिकट आईडी नोट वा स्क्रिनसट गर्नुहोस्।",



    phonePlaceholder: "१० अंक (जस्तै ९८XXXXXXXX)",



    btnNew: "अर्को गुनासो दर्ता गर्नुहोस्",



    ratingSuccessTitle: "तपाईंको मूल्याङ्कनको लागि धन्यवाद!",



    ratingSuccessText: "तपाईंको प्रतिक्रियाले हामीलाई बिरामी सेवा सुधार गर्न मद्दत गर्दछ।",



    welcomeText: "रामलाल गोल्छा आँखा अस्पताल फाउन्डेसनमा स्वागत छ",



    btnHome: "मुख्य पृष्ठमा फर्कनुहोस्",







    categories: {



      DOCTOR: "डाक्टरको व्यवहार",



      STAFF: "कर्मचारीको व्यवहार",



      WAITING: "लामो समय कुर्नुपरेको",



      BILLING: "बिलिङ वा फिर्ता समस्या",



      CLEANLINESS: "सरसफाई र स्वच्छता",



      PHARMACY: "फार्मेसी / औषधि काउन्टर",



      OPTICAL: "चश्मा काउन्टर / अप्टिकल",



      SURGERY: "शल्यक्रिया प्रक्रिया / ढिलाइ",



      CAMP: "बाहिरी शिविर सेवाहरू",



      CANTEEN: "खाजा घर / क्यान्टिन",



      COMMUNICATION: "सञ्चार वा गलत सूचना",



      SUGGESTION: "सुझाव वा प्रशंसा",



      EMERGENCY_COMPLAINT: "अति जरुरी समस्या",



      OTHER: "अन्य समस्या"



    },







    locations: {



      OPD: "ओ.पि.डि. (OPD)",



      IPD: "वार्ड / भर्ना विभाग (IPD)",



      Pharmacy: "फार्मेसी काउन्टर",



      Optical: "अप्टिकल रिफ्र्याक्सन",



      Billing: "बिलिङ / नगद काउन्टर",



      OT: "शल्यक्रिया कक्ष (OT) क्षेत्र",



      Canteen: "क्यान्टिन",



      "Lab & Diagnostics": "प्रयोगशाला र डायग्नोस्टिक्स",



      Reception: "सोधपुछ / हेल्प डेस्क",



      Other: "अन्य स्थान"



    }



  },



  hi: {



    title: "रोगी प्रतिक्रिया और शिकायत पोर्टल",



    subtitle: "आर.एल.जी. नेत्र अस्पताल - आपकी दृष्टि और सेवा के लिए समर्पित",



    introText: "आपकी प्रतिक्रिया हमें बेहतर सेवा देने में मदद करती है। अपनी शिकायत, सुझाव या सराहना १ मिनट से कम समय में दर्ज करें। आप बिना नाम बताए भी शिकायत दर्ज कर सकते हैं।",

    portalSubtitle1: "सभी के लिए बेहतर स्वास्थ्य सेवा सुनिश्चित करने में हमारी मदद करें।",
    portalSubtitle2:
      "अपने अनुभव, शिकायतें या प्रशंसा साझा करें। आपके द्वारा भेजी गई जानकारी पूरी तरह से सुरक्षित, गोपनीय रहेगी और इस पर पूरी संवेदनशीलता के साथ ध्यान दिया जाएगा।",



    languageLabel: "भाषा चुनें",



    headerName: "Ramlal Golchha Eye Hospital Foundation",



    headerTagline: "Under the Management of Nepal Eye Program, Tilganga Institute of Ophthalmology",







    ratingLabel: "कुल मिलाकर हमारे अस्पताल की सेवाएँ आपको आज कैसी लगीं?",



    ratingDescription: ["मूल्यांकन", "बहुत खराब", "खराब", "सामान्य", "अच्छा", "उत्कृष्ट"],



    haveComplaint: "शिकायत है?",



    ratingFeedbackLabel: "वैकल्पिक प्रतिक्रिया (और बताएं)",



    ratingFeedbackPlaceholder: "अपना अनुभव साझा करें (वैकल्पिक)",



    sendRating: "मूल्यांकन भेजें",



    rateOtherDepartment: "अन्य विभाग मूल्यांकन करें",



    rateDepartments: "विभागों का मूल्यांकन करें",



    ratedBadge: "मूल्यांकित",



    dailyRatingLimit: "आज के लिए मूल्यांकन पहले ही भेजा जा चुका है। कृपया कल फिर प्रयास करें।",







    locationLabel: "विभाग के अनुसार प्रतिक्रिया दें",



    locationSelect: "विभाग चुनें",







    descriptionLabel: "शिकायत या प्रतिक्रिया का विवरण लिखें",



    descriptionPlaceholder: "क्या हुआ था विस्तार से लिखें (जैसे: कर्मचारी का व्यवहार, बिलिंग में देरी आदि)।",







    voiceLabel: "आवाज रिकॉर्ड करें (यदि टाइप करने में कठिनाई हो)",



    voiceRecordStart: "रिकॉर्डिंग शुरू करें",



    voiceRecordStop: "रिकॉर्डिंग बंद करें",



    voicePlaying: "आवाज चल रही है...",



    voiceDelete: "हटाएं",



    voiceMicPermission: "कृपया आवाज रिकॉर्ड करने के लिए माइक की अनुमति दें।",



    voiceSupported: "आवाज रिकॉर्डिंग उपलब्ध है।",







    anonymousLabel: "अनाम रूप से सबमिट करें?",



    anonymousYes: "हाँ, मेरी पहचान गुप्त रखें",



    anonymousNo: "नहीं, मेरा संपर्क विवरण साझा करें",







    contactSection: "शिकायतकर्ता संपर्क विवरण",



    nameLabel: "आपका पूरा नाम",



    phoneLabel: "फ़ोन / व्हाट्सएप नंबर",



    phoneHelp: "हम इस नंबर पर शिकायत संबंधी अपडेट भेजेंगे।",



    patientIdLabel: "मरीज़ आईडी / EMR ID (वैकल्पिक)",



    patientIdPlaceholder: "उदाहरण: RLG-10023",



    chooseFilePlaceholder: "फ़ाइल चुनें (तस्वीर, वीडियो, PDF)...",







    indToggleLabel: "किसी विशिष्ट व्यक्ति के बारे में शिकायत",



    indNameLabel: "नाम (यदि ज्ञात हो)",



    indAppearanceLabel: "शारीरिक बनावट या रूप (यदि नाम ज्ञात न हो)",



    indRoleLabel: "पद / भूमिका",







    attachmentLabel: "फोटो या दस्तावेज अपलोड करें (वैकल्पिक)",







    submitComplaint: "विभागीय शिकायत",



    btnSubmit: "जमा करें",



    btnIndividualComplaint: "व्यक्तिगत शिकायत",

    selectComplaintType: "शिकायत प्रकार चुनें",
    departmentComplaint: "विभागीय शिकायत",
    departmentComplaintDesc: "किसी विशेष विभाग या सेवा के बारे में शिकायत दर्ज करें",
    individualComplaint: "व्यक्तिगत शिकायत",
    individualComplaintDesc: "किसी विशेष व्यक्ति या कर्मचारी के बारे में शिकायत दर्ज करें",

    btnSubmitting: "सुरक्षित रूप से दर्ज की जा रही है...",



    validationError: "कृपया अनिवार्य क्षेत्र भरें: विवरण (या आवाज रिकॉर्ड करें)।",

    indRequiredFieldsError: "कृपया शिकायत दर्ज करने से पहले सभी आवश्यक फ़ील्ड भरें।",

    contactValidationError: "बिना नाम के सबमिट करते समय कृपया अपना नाम या फ़ोन नंबर दें।",







    successTitle: "शिकायत सफलतापूर्वक दर्ज की गई",



    successText: "अपना अनुभव साझा करने के लिए धन्यवाद। हम हर शिकायत को गंभीरता से लेते हैं और तुरंत जांच करेंगे।",



    ticketLabel: "आपकी टिकट संख्या (Ticket ID)",



    ticketHelp: "आपकी शिकायत दर्ज कर ली गई है। जल्द ही उचित कार्रवाई की जाएगी। कृपया संदर्भ के लिए इस टिकट आईडी को नोट करें या स्क्रीनशॉट लें।",



    phonePlaceholder: "10 अंक (जैसे 98XXXXXXXX)",



    btnNew: "एक और शिकायत दर्ज करें",



    ratingSuccessTitle: "आपके मूल्यांकन के लिए धन्यवाद!",



    ratingSuccessText: "आपकी प्रतिक्रिया हमें मरीजों की देखभाल बेहतर बनाने में मदद करती है।",



    welcomeText: "रामलाल गोल्छा नेत्र अस्पताल फाउंडेशन में आपका स्वागत है",



    btnHome: "मुख्य पृष्ठ पर लौटें",







    categories: {



      DOCTOR: "डॉक्टर का व्यवहार",



      STAFF: "कर्मचारी का व्यवहार",



      WAITING: "लंबा प्रतीक्षा समय",



      BILLING: "बिलिंग / रिफंड की समस्या",



      CLEANLINESS: "सफाई और स्वच्छता",



      PHARMACY: "फार्मेसी / दवा काउंटर",



      OPTICAL: "चश्मा काउंटर / ऑप्टिकल",



      SURGERY: "सर्जरी प्रक्रिया / देरी",



      CAMP: "बाहरी शिविर सेवाएं",



      CANTEEN: "कैंटीन / भोजन",



      COMMUNICATION: "संचार / गलत जानकारी",



      SUGGESTION: "सुझाव या सराहना",



      EMERGENCY_COMPLAINT: "आपातकालीन समस्या",



      OTHER: "अन्य समस्या"



    },







    locations: {



      OPD: "ओ.पी.डी. (OPD)",



      IPD: "वार्ड / रोगी विभाग (IPD)",



      Pharmacy: "फार्मेसी काउंटर",



      Optical: "ऑप्टिकल रिफ्रैक्शन",



      Billing: "बिलिंग / कैश काउंटर",



      OT: "ऑपरेशन थिएटर (OT) क्षेत्र",



      Canteen: "कैंटीन",



      "Lab & Diagnostics": "लैब और डायग्नोस्टिक्स",



      Reception: "पूछताछ / हेल्प डेस्क",



      Other: "अन्य स्थान"



    }



  }



};







type LangKey = "en" | "ne" | "hi";











const DepartmentPlaceholderIcon = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M3 21h18M5 21V7.5L12 4l7 3.5V21M9 21v-5h6v5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 8.5v3.25M10.375 10.125h3.25"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

const CustomDepartmentSelect = ({



  value,



  onChange,



  options,



  isDark,



  placeholder



}: {



  value: string,



  onChange: (val: string) => void,



  options: [string, string][],



  isDark: boolean,



  placeholder: string



}) => {



  const [isOpen, setIsOpen] = useState(false);



  const dropdownRef = useRef<HTMLDivElement>(null);







  useEffect(() => {



    const handleClickOutside = (e: MouseEvent) => {



      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {



        setIsOpen(false);



      }



    };



    document.addEventListener("mousedown", handleClickOutside);



    return () => document.removeEventListener("mousedown", handleClickOutside);



  }, []);







  const selectedOption = options.find(([k]) => k === value);







  // Sort: selected department first, then remaining in original order



  const sortedOptions = value



    ? [



      ...options.filter(([k]) => k === value),



      ...options.filter(([k]) => k !== value),



    ]



    : options;







  return (



    <div className="relative w-full" ref={dropdownRef} style={{ zIndex: isOpen ? 50 : 1 }}>



      <div



        onClick={() => setIsOpen(!isOpen)}



        className={`w-full px-4 py-3.5 rounded-xl border text-base cursor-pointer flex items-center justify-between transition-all duration-200 shadow-sm ${isOpen



          ? (isDark ? "bg-slate-800/80 border-teal-500 ring-2 ring-teal-500/20 text-slate-100" : "bg-white border-teal-500 ring-2 ring-teal-500/20 text-slate-800")



          : (isDark



            ? "bg-slate-800/60 border-slate-700 hover:border-teal-500/50 text-slate-100"



            : "bg-white/80 border-slate-200 hover:border-teal-500/50 text-slate-800 backdrop-blur-sm")



          }`}



      >



        <div className="flex items-center gap-3 font-semibold">



          {value ? (



            <>



              <div className={`${getDepartmentSelectIconSizeClass(value)} flex items-center justify-center`}>



                <DepartmentIcon department={value} />



              </div>



              <span className="truncate">{selectedOption ? selectedOption[1] : value}</span>



            </>



          ) : (
            <>
              <div
                className={`w-6 h-6 shrink-0 flex items-center justify-center ${
                  isDark ? "text-teal-400/90" : "text-teal-600"
                }`}
              >
                <DepartmentPlaceholderIcon />
              </div>
              <span className={`truncate font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                {placeholder}
              </span>
            </>
          )}



        </div>



        <svg className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180 text-teal-500" : (isDark ? "text-slate-400" : "text-slate-500")}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">



          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />



        </svg>



      </div>







      <AnimatePresence>



        {isOpen && (



          <motion.div



            initial={{ opacity: 0, y: -8, scale: 0.97 }}



            animate={{ opacity: 1, y: 0, scale: 1 }}



            exit={{ opacity: 0, y: -8, scale: 0.97 }}



            transition={{ duration: 0.15, ease: "easeOut" }}



            className={`absolute z-[120] w-full mt-2 rounded-xl border shadow-2xl max-h-72 overflow-y-auto backdrop-blur-xl p-2 flex flex-col gap-1.5 ${isDark ? "bg-slate-900/98 border-slate-600 shadow-black/50" : "bg-white/95 border-slate-200 shadow-slate-300/50"



              }`}



          >



            {sortedOptions.map(([key, val]) => (



              <div



                key={key}



                onClick={() => {



                  onChange(key);



                  setIsOpen(false);



                }}



                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all duration-150 ${value === key



                  ? (isDark ? "bg-teal-500/15 text-teal-300 border-teal-500/60 shadow-sm" : "bg-teal-50 text-teal-700 border-teal-400 shadow-sm")



                  : (isDark ? "bg-slate-800/80 border-slate-600 text-slate-100 hover:bg-slate-700/80 hover:border-slate-500" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-teal-300/70")



                  }`}



              >



                <div className={`${getDepartmentSelectIconSizeClass(key)} flex items-center justify-center ${value === key ? "opacity-100" : "opacity-70"}`}>



                  <DepartmentIcon department={key} />



                </div>



                <span className={`text-sm sm:text-base ${value === key ? "font-bold" : "font-medium"}`}>{val}</span>



                {value === key && (



                  <svg className="w-4 h-4 ml-auto text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>



                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />



                  </svg>



                )}



              </div>



            ))}



          </motion.div>


        )}


      </AnimatePresence>



    </div>



  );



};











const getDepartmentGridIconSizeClass = (department: string) =>
  department === "Optical" || department === "Pharmacy"
    ? "w-11 h-11 sm:w-14 sm:h-14"
    : "w-9 h-9 sm:w-11 sm:h-11";

const getDepartmentSelectIconSizeClass = (department: string) =>
  department === "Pharmacy" ? "w-8 h-8" : "w-6 h-6";

const DepartmentIcon = ({ department, className = "w-full h-full" }: { department: string, className?: string }) => {



  switch (department) {



    case "OPD": return (



      <svg viewBox="0 0 128 128" className={className} aria-label="OPD">



        <path d="M0 0h128v128H0z" fill="none" />



        <path fill="none" stroke="#BDBDBD" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="6" d="M60.55 98.3c-16.79 4.83-26.01-18.83-29.53-27.27C24 54.17 5.69 42.41 7.04 30s16.6-11.17 16.6-11.17" />



        <path fill="none" stroke="#BDBDBD" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="6" d="M59.5 98.3c16.89-4.48 11.39-28.91 10.07-37.96c-2.63-18.08 7.04-37.57-.49-47.52S49.1 11.76 49.1 11.76" />



        <circle cx="101.84" cy="32.23" r="15.25" fill="#878787" />



        <circle cx="102.38" cy="31.13" r="13.41" fill="#BDBDBD" />



        <path fill="none" stroke="#03A9F4" strokeMiterlimit="10" strokeWidth="8" d="M69.39 58.93c-.89 6.74 10.14 31.36-6.97 38.1c-19.16 7.56-26.31-20.55-31.39-26" />



        <path fill="none" stroke="#03A9F4" strokeMiterlimit="10" strokeWidth="5" d="M32.63 73.54s10.77 11.36 23.4 6.15C68 74.75 69.86 61.64 69.86 61.64" />



        <path fill="#212121" d="M100.96 21.43c-5.24 1.22-8.49 6.45-7.28 11.69c.18.78.46 1.54.83 2.26l.68 1.34c-1.92 2.51-3.48 3.47-4.01 6.38c1.36 1.33 2.95 2.39 4.69 3.13c0-.01.01-.02.01-.03c0 .01.01.02.01.04c2.87 1.22 6.14 1.59 9.42.83c.37-.09.72-.2 1.07-.31l-.31-2.8s.4-3.55.49-3.74c.23-.45 1.16-.69 1.64-.97c1.16-.7 2.17-1.65 2.95-2.76a9.8 9.8 0 0 0 1.5-7.78c-1.22-5.24-6.46-8.5-11.69-7.28" opacity=".22" />



        <path fill="none" stroke="#03A9F4" strokeMiterlimit="10" strokeWidth="8" d="M60.42 96.03c9.59 21.97 24.29 25.08 35.15 23.19c9.54-1.67 22.17-10.22 22.14-25.72c-.04-18.68-12.5-17.5-19.25-29.47c-8.41-14.92 3.05-28.62 3.05-28.62" />



        <path fill="#212121" d="M94.74 38.77s1.9-.97 3.72.07c2.88 1.64 3.16 3.98 3.16 3.98s1.74-3.46 2.67-4.4c.92-.95-5.57-5.66-7.04-3.85s-2.51 4.2-2.51 4.2" opacity=".22" />



        <path fill="#616161" d="M27.83 14.04c-1.5.01-2.82.73-3.69 1.82l-1.24-.98c-1.13-.89-2.79-.08-2.78 1.36l.04 5.19c.01 1.44 1.68 2.23 2.79 1.32l1.21-.98c.88 1.09 2.22 1.8 3.73 1.79c2.63-.02 4.75-2.17 4.73-4.8s-2.16-4.74-4.79-4.72m25.3-1.82l-2.65-4.46c-.74-1.24-2.58-1.07-3.08.27l-.55 1.48c-1.31-.49-2.81-.42-4.1.35a4.76 4.76 0 0 0-1.66 6.53a4.76 4.76 0 0 0 6.53 1.66c1.3-.77 2.08-2.07 2.27-3.46l1.54.21c1.42.19 2.44-1.34 1.7-2.58" />



        <circle cx="104.19" cy="29.3" r="9.12" fill="#424242" />



        <circle cx="104.65" cy="28.59" r="7.08" fill="#D1D1D1" />



        <path fill="#757575" d="M42.37 15.11c-.83-1.19-.67-3.41.76-4.42s3.59-.57 4.42.76c.93 1.48-1.5.15-2.93 1.16s-1.25 3.94-2.25 2.5m-17.36 2.14c.36-1.41 2.13-2.74 3.83-2.32s2.78 2.33 2.32 3.83c-.51 1.67-1.1-1.04-2.8-1.45c-1.69-.42-3.78 1.64-3.35-.06" />



      </svg>



    );



    case "IPD": return (



      <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="IPD">



        <path d="M2 20h20" stroke="#8B5CF6" strokeWidth={2} strokeLinecap="round" />



        <path d="M4 20V8a2 2 0 012-2h12a2 2 0 012 2v12" stroke="#8B5CF6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />



        <rect x="6" y="10" width="12" height="3" rx="1" fill="#A78BFA" />



        <rect x="6" y="14" width="12" height="3" rx="1" fill="#A78BFA" />



        <rect x="6" y="18" width="12" height="2" rx="1" fill="#A78BFA" />



      </svg>



    );



    case "Pharmacy": return (



      <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="Pharmacy">



        <g transform="rotate(-35 12 12)">



          <path d="M4 12a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4z" fill="#EF4444" />



          <path d="M12 8h4a4 4 0 0 1 0 8h-4V8z" fill="#FBBF24" />



          <path d="M4 12a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" stroke="#DC2626" strokeWidth="1.25" />



          <ellipse cx="7.5" cy="10.25" rx="1.25" ry="0.65" fill="#FCA5A5" opacity="0.85" />



        </g>



      </svg>



    );



    case "Optical": return (



      <svg viewBox="0 0 128 128" className={className} aria-label="Optical">



        <path d="M0 0h128v128H0z" fill="none" />



        <path fill="#90CAF9" d="M52.44 53.27c-1.03-1.71-3.17-5.28-18.55-5.69c-10.54-.36-16.68.93-18.81 3.97c-.93 1.46-1.85 5-.95 13.57c1.56 14.33 8.76 14.71 17.89 15.18l.69.04c.99.05 1.92.08 2.8.08c12.94 0 15.2-5.65 16.86-13.48c1.48-6.67 1.51-11.26.07-13.67m60.26-1.76c-2.1-3.01-8.24-4.29-18.78-3.93c-15.39.42-17.53 3.98-18.56 5.69c-1.44 2.41-1.42 7 .08 13.64c1.67 7.85 3.92 13.49 16.86 13.49c.88 0 1.82-.03 2.8-.08l.69-.04c9.12-.47 16.33-.85 17.89-15.18c.89-8.55-.03-12.09-.98-13.59" opacity=".8" />



        <path fill="#804833" d="M123.8 47.84s-1-1.7-19.03-3.41c-18.93-1.8-28.35 2-32.25 4.41c-.7.3-1.9.6-3.31.5h-.3c-1.9-.1-3.61-.2-5.61-.2h-.1c-1.1 0-3.51.1-5.21.2c-.8.1-1.5 0-2.1-.2c-3.61-2.4-13.02-6.61-32.75-4.71C5.1 46.14 4.1 47.84 4.1 47.84L4 54.65s2.7.8 4.41 2.9c1.7 2.1 2.5 14.12 5.41 19.73c4.4 8.72 26.14 6.52 26.14 6.52s8.91.7 13.22-6.81c3.71-6.41 5.21-15.43 5.61-17.63c.9-.9 2.6-2 5.11-2.1c2.8 0 4.61 1.4 5.41 2.4c.4 2.7 1.9 11.22 5.51 17.33c4.31 7.51 13.22 6.81 13.22 6.81s21.74 2.2 26.14-6.51c2.8-5.61 3.61-17.63 5.41-19.73c1.7-2.2 4.41-2.9 4.41-2.9zM51.38 66.71c-1.7 8.01-3.91 13.42-18.63 12.62c-9.52-.5-16.13-.5-17.63-14.32c-.9-8.61.1-11.82.8-12.92c.7-1 3.21-4.01 17.93-3.51c14.72.4 16.83 3.71 17.73 5.21s1.6 4.91-.2 12.92m61.3-1.7c-1.5 13.82-8.11 13.82-17.63 14.32c-14.72.8-16.93-4.61-18.63-12.62c-1.8-8.01-1.1-11.42-.2-12.92s3.01-4.81 17.73-5.21c14.72-.5 17.23 2.5 17.93 3.51c.7 1.1 1.7 4.3.8 12.92" />



        <path fill="#FFF" d="M26.82 52.22c4.33-.84 5.79 1.26 5.37 3.14c-.77 3.47-4.11 1.62-9 4.6c-2.06 1.26-2.9 2.16-3.66 2.13c-.73-.03-1.36-.78-1.01-2.2c.63-2.58 1.68-6.39 8.3-7.67m56.84.99c1.77-.99 6.74-1.88 7.27.73c.54 2.69-1.99 3.43-3.78 4.04c-4.23 1.44-4.93 3.49-5.81 4.05c-.59.37-2.33 1.21-2.14-1.34c.22-3.24 1.28-5.69 4.46-7.48" opacity=".7" />



      </svg>



    );



    case "Billing": return (



      <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="Billing">



        <rect x="2" y="5" width="20" height="14" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth={2} />



        <rect x="2" y="10" width="20" height="2" fill="#FBBF24" />



        <circle cx="7" cy="15" r="1.5" fill="#FEF3C7" />



        <circle cx="11" cy="15" r="1.5" fill="#FEF3C7" />



        <circle cx="15" cy="15" r="1.5" fill="#FEF3C7" />



      </svg>



    );



    case "OT": return (



      <svg viewBox="0 0 1200 1200" className={className} aria-label="Operation Theater">



        <path d="M0 0h1200v1200H0z" fill="none" />



        <path fill="#8B5CF6" d="M516.786 78.404c-89.537 0-162.129 72.592-162.129 162.129c7.674 109.36 81.438 140.506 162.946 201.74c60.609 38.349 53.187 81.094 65.404 149.848c-53.95 13.664-118.616 29.877-157.011-2.765l-91.505-65.098c-.131-.108-.277-.2-.409-.307c-27.968-22.936-63.775-36.745-102.764-36.745c-68.543 0-127.057 42.54-150.768 102.66c-3.122 12.076-5.116 12.008-15.66 11.977c-35.857 0-64.89 29.032-64.89 64.894c0 35.858 29.033 64.893 64.893 64.893c30.988-3.452 19.907-7.164 37.461 15.967c29.63 38.812 76.376 63.869 128.966 63.869c66.145 0 122.994-39.62 148.209-96.418c28.644 16.406 53.42 22.574 86.081 27.02H1200c-90.997-165.847-316.997-140.223-465.608-154.451c-30.518-75.807-37.399-175.94-108.188-226.817h-.717c32.815-29.67 53.429-72.545 53.429-120.267c-.001-89.538-72.593-162.13-162.13-162.13zm0 81.064c44.769 0 81.063 36.296 81.063 81.063c0 44.769-36.296 81.064-81.063 81.064c-44.769 0-81.064-36.296-81.064-81.064s36.297-81.063 81.064-81.063M231.32 568.27c44.768 0 81.064 36.296 81.064 81.064s-36.296 81.063-81.064 81.063s-81.064-36.297-81.064-81.063c0-44.768 36.297-81.064 81.064-81.064m432.754 33.98c25.438 0 46.059 20.622 46.059 46.06s-20.621 46.06-46.059 46.06s-46.061-20.62-46.061-46.06c.002-25.438 20.623-46.06 46.061-46.06m3.48 222.007c62.491 126.303 105.737 281.315 263.46 297.339l-111.158-297.34zm-487.615 89.765v72.468h157.932v-72.468zm284.237 0v72.468h174.311l-33.367-72.468zm495.497 0l21.494 72.468H1139.1v-72.468z" />



      </svg>



    );



    case "Canteen": return (



      <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="Canteen">



        <path d="M18 8h1a4 4 0 010 8h-1" stroke="#F97316" strokeWidth={2} strokeLinecap="round" />



        <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" fill="#F97316" stroke="#C2410C" strokeWidth={2} />



        <line x1="6" y1="1" x2="6" y2="4" stroke="#F97316" strokeWidth={2} strokeLinecap="round" />



        <line x1="10" y1="1" x2="10" y2="4" stroke="#F97316" strokeWidth={2} strokeLinecap="round" />



        <line x1="14" y1="1" x2="14" y2="4" stroke="#F97316" strokeWidth={2} strokeLinecap="round" />



        <path d="M6 12h12" stroke="#FED7AA" strokeWidth={2} strokeLinecap="round" />



      </svg>



    );



    case "Lab & Diagnostics": return (



      <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="Lab & Diagnostics">



        <path d="M6 18v-6" stroke="#10B981" strokeWidth={2} strokeLinecap="round" />



        <path d="M10 18v-3" stroke="#10B981" strokeWidth={2} strokeLinecap="round" />



        <path d="M14 18v-8" stroke="#10B981" strokeWidth={2} strokeLinecap="round" />



        <path d="M18 18V6" stroke="#10B981" strokeWidth={2} strokeLinecap="round" />



        <path d="M2 18h20" stroke="#10B981" strokeWidth={2} strokeLinecap="round" />



        <circle cx="6" cy="10" r="2" fill="#34D399" />



        <circle cx="10" cy="13" r="2" fill="#34D399" />



        <circle cx="14" cy="8" r="2" fill="#34D399" />



        <circle cx="18" cy="6" r="2" fill="#34D399" />



      </svg>



    );



    case "Reception": return (



      <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="Reception">



        <path d="M2 20h20" stroke="#6366F1" strokeWidth={2} strokeLinecap="round" />



        <path d="M4 20V10a2 2 0 012-2h12a2 2 0 012 2v10" stroke="#6366F1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />



        <rect x="8" y="14" width="3" height="6" fill="#818CF8" />



        <rect x="13" y="14" width="3" height="6" fill="#818CF8" />



        <rect x="6" y="10" width="12" height="3" fill="#A5B4FC" />



        <circle cx="12" cy="11.5" r="1" fill="#E0E7FF" />



      </svg>



    );



    case "Other": return (



      <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="Other">



        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="#64748B" stroke="#475569" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />



        <path d="M14 2v6h6" fill="#94A3B8" stroke="#475569" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />



        <path d="M16 13H8" stroke="#CBD5E1" strokeWidth={2} strokeLinecap="round" />



        <path d="M16 17H8" stroke="#CBD5E1" strokeWidth={2} strokeLinecap="round" />



        <path d="M10 9H8" stroke="#CBD5E1" strokeWidth={2} strokeLinecap="round" />



      </svg>



    );



    default: return (



      <svg viewBox="0 0 24 24" fill="none" className={className}>



        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="#64748B" stroke="#475569" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />



      </svg>



    );



  }



};







export default function Home() {



  const [lang, setLang] = useState<LangKey>("ne");



  const [theme, setTheme] = useState<"dark" | "light">("dark");



  const t = translations[lang];
  const reduceMotion = useReducedMotion();
  const [subtitle2RevealReady, setSubtitle2RevealReady] = useState(false);

  const [ratingHydrated, setRatingHydrated] = useState(false);



  /** True only after a successful hospital rating submission today (persisted). */
  const [hospitalRated, setHospitalRated] = useState<boolean>(false);



  /** Session-only: user closed the gate without submitting — not persisted, resets on reload. */
  const [hospitalGateDismissed, setHospitalGateDismissed] = useState<boolean>(false);



  const kathmanduDateRef = useRef<string | null>(null);







  // Form Fields State



  const [rating, setRating] = useState<number>(5);



  const [selectedRating, setSelectedRating] = useState<number>(0);



  const [hoverRating, setHoverRating] = useState<number>(0);



  const [ratingFeedback, setRatingFeedback] = useState<string>("");



  const [department, setDepartment] = useState<string>("");



  const [description, setDescription] = useState<string>("");



  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);



  const [complainantName, setComplainantName] = useState<string>("");



  const [complainantPhone, setComplainantPhone] = useState<string>("");



  const [patientId, setPatientId] = useState<string>("");



  const [attachment, setAttachment] = useState<File | null>(null);







  // Individual Complaint State



  const [isIndividualComplaint, setIsIndividualComplaint] = useState<boolean>(false);



  const [indName, setIndName] = useState<string>("");



  const [indAppearance, setIndAppearance] = useState<string>("");



  const [indDepartment, setIndDepartment] = useState<string>("");



  const [indRole, setIndRole] = useState<string>("");



  // Individual Complaint Modal State
  const [isIndividualModalOpen, setIsIndividualModalOpen] = useState<boolean>(false);

  // Complaint Type Selection Modal State
  const [isComplaintTypeModalOpen, setIsComplaintTypeModalOpen] = useState<boolean>(false);





  // Modal States



  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);



  const [modalView, setModalView] = useState<"rating" | "complaint">("rating");







  // Audio Recording State



  const [isRecording, setIsRecording] = useState<boolean>(false);



  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);



  const [audioUrl, setAudioUrl] = useState<string | null>(null);



  const [recordingTime, setRecordingTime] = useState<number>(0);







  // Submit & UI Control States



  const [submitting, setSubmitting] = useState<boolean>(false);



  const [errorMsg, setErrorMsg] = useState<string | null>(null);



  const [successTicketId, setSuccessTicketId] = useState<string | null>(null);



  const [successType, setSuccessType] = useState<"rating" | "complaint" | null>(null);



  const [ratedDepartments, setRatedDepartments] = useState<Set<string>>(new Set());



  // Department theme configuration for unique popup designs
  const departmentThemes: Record<string, {
    primary: string;
    secondary: string;
    gradientFrom: string;
    gradientTo: string;
    bgLight: string;
    bgDark: string;
    textLight: string;
    textDark: string;
    borderLight: string;
    borderDark: string;
    shadowLight: string;
    shadowDark: string;
    accentLight: string;
    accentDark: string;
    animation: string;
  }> = {
    OPD: {
      primary: "#3b82f6",
      secondary: "#60a5fa",
      gradientFrom: "#3b82f6",
      gradientTo: "#8b5cf6",
      bgLight: "bg-blue-50",
      bgDark: "backdrop-blur-xl bg-blue-950/60",
      textLight: "text-blue-900",
      textDark: "text-blue-100",
      borderLight: "border-blue-200",
      borderDark: "border-blue-500/30",
      shadowLight: "shadow-blue-500/20",
      shadowDark: "shadow-blue-500/20",
      accentLight: "bg-blue-100",
      accentDark: "bg-blue-500/40",
      animation: "animate-pulse"
    },
    IPD: {
      primary: "#8b5cf6",
      secondary: "#a78bfa",
      gradientFrom: "#8b5cf6",
      gradientTo: "#ec4899",
      bgLight: "bg-purple-50",
      bgDark: "backdrop-blur-xl bg-purple-950/60",
      textLight: "text-purple-900",
      textDark: "text-purple-100",
      borderLight: "border-purple-200",
      borderDark: "border-purple-500/30",
      shadowLight: "shadow-purple-500/20",
      shadowDark: "shadow-purple-500/20",
      accentLight: "bg-purple-100",
      accentDark: "bg-purple-500/40",
      animation: "animate-bounce"
    },
    Pharmacy: {
      primary: "#10b981",
      secondary: "#34d399",
      gradientFrom: "#10b981",
      gradientTo: "#06b6d4",
      bgLight: "bg-emerald-50",
      bgDark: "backdrop-blur-xl bg-emerald-950/60",
      textLight: "text-emerald-900",
      textDark: "text-emerald-100",
      borderLight: "border-emerald-200",
      borderDark: "border-emerald-500/30",
      shadowLight: "shadow-emerald-500/20",
      shadowDark: "shadow-emerald-500/20",
      accentLight: "bg-emerald-100",
      accentDark: "bg-emerald-500/40",
      animation: "animate-pulse"
    },
    Optical: {
      primary: "#f59e0b",
      secondary: "#fbbf24",
      gradientFrom: "#f59e0b",
      gradientTo: "#ef4444",
      bgLight: "bg-amber-50",
      bgDark: "backdrop-blur-xl bg-sky-950/60",
      textLight: "text-amber-900",
      textDark: "text-sky-100",
      borderLight: "border-amber-200",
      borderDark: "border-sky-500/30",
      shadowLight: "shadow-amber-500/20",
      shadowDark: "shadow-sky-500/20",
      accentLight: "bg-amber-100",
      accentDark: "bg-sky-500/40",
      animation: "animate-spin"
    },
    Billing: {
      primary: "#06b6d4",
      secondary: "#22d3ee",
      gradientFrom: "#06b6d4",
      gradientTo: "#3b82f6",
      bgLight: "bg-cyan-50",
      bgDark: "backdrop-blur-xl bg-cyan-950/60",
      textLight: "text-cyan-900",
      textDark: "text-cyan-100",
      borderLight: "border-cyan-200",
      borderDark: "border-cyan-500/30",
      shadowLight: "shadow-cyan-500/20",
      shadowDark: "shadow-cyan-500/20",
      accentLight: "bg-cyan-100",
      accentDark: "bg-cyan-500/40",
      animation: "animate-pulse"
    },
    OT: {
      primary: "#ef4444",
      secondary: "#f87171",
      gradientFrom: "#ef4444",
      gradientTo: "#f97316",
      bgLight: "bg-red-50",
      bgDark: "backdrop-blur-xl bg-red-950/60",
      textLight: "text-red-900",
      textDark: "text-red-100",
      borderLight: "border-red-200",
      borderDark: "border-red-500/30",
      shadowLight: "shadow-red-500/20",
      shadowDark: "shadow-red-500/20",
      accentLight: "bg-red-100",
      accentDark: "bg-red-500/40",
      animation: "animate-pulse"
    },
    Canteen: {
      primary: "#f97316",
      secondary: "#fb923c",
      gradientFrom: "#f97316",
      gradientTo: "#eab308",
      bgLight: "bg-orange-50",
      bgDark: "backdrop-blur-xl bg-orange-950/60",
      textLight: "text-orange-900",
      textDark: "text-orange-100",
      borderLight: "border-orange-200",
      borderDark: "border-orange-500/30",
      shadowLight: "shadow-orange-500/20",
      shadowDark: "shadow-orange-500/20",
      accentLight: "bg-orange-100",
      accentDark: "bg-orange-500/40",
      animation: "animate-bounce"
    },
    "Lab & Diagnostics": {
      primary: "#6366f1",
      secondary: "#818cf8",
      gradientFrom: "#6366f1",
      gradientTo: "#8b5cf6",
      bgLight: "bg-indigo-50",
      bgDark: "backdrop-blur-xl bg-indigo-950/60",
      textLight: "text-indigo-900",
      textDark: "text-indigo-100",
      borderLight: "border-indigo-200",
      borderDark: "border-indigo-500/30",
      shadowLight: "shadow-indigo-500/20",
      shadowDark: "shadow-indigo-500/20",
      accentLight: "bg-indigo-100",
      accentDark: "bg-indigo-500/40",
      animation: "animate-pulse"
    },
    Reception: {
      primary: "#14b8a6",
      secondary: "#2dd4bf",
      gradientFrom: "#14b8a6",
      gradientTo: "#10b981",
      bgLight: "bg-teal-50",
      bgDark: "backdrop-blur-xl bg-teal-950/60",
      textLight: "text-teal-900",
      textDark: "text-teal-100",
      borderLight: "border-teal-200",
      borderDark: "border-teal-500/30",
      shadowLight: "shadow-teal-500/20",
      shadowDark: "shadow-teal-500/20",
      accentLight: "bg-teal-100",
      accentDark: "bg-teal-500/40",
      animation: "animate-pulse"
    },
    Other: {
      primary: "#64748b",
      secondary: "#94a3b8",
      gradientFrom: "#64748b",
      gradientTo: "#475569",
      bgLight: "bg-slate-50",
      bgDark: "backdrop-blur-xl bg-slate-800/70",
      textLight: "text-slate-900",
      textDark: "text-slate-100",
      borderLight: "border-slate-200",
      borderDark: "border-slate-500/30",
      shadowLight: "shadow-slate-500/20",
      shadowDark: "shadow-slate-500/20",
      accentLight: "bg-slate-100",
      accentDark: "bg-slate-500/40",
      animation: "animate-pulse"
    }
  };



  // Get current department theme
  const currentTheme = departmentThemes[department] || departmentThemes.Other;



  // Get next unrated department in sequence

  const allDepartmentKeys = Object.keys(t.locations);



  const hasUnratedDepartment = allDepartmentKeys.some((dept) => !ratedDepartments.has(dept));



  const confirmHospitalRatedToday = () => {

    setHospitalRated(true);

    setHospitalRatedPersisted();

  };



  /** Hide hospital gate for this page session only (close / complaint path without hospital POST). */
  const dismissHospitalGate = () => {

    setHospitalGateDismissed(true);

  };



  const markDepartmentRated = (dept: string) => {

    const list = addRatedDepartmentPersisted(dept);

    setRatedDepartments(new Set(list));

  };



  const goToDepartmentSelection = () => {

    setSuccessTicketId(null);

    setSuccessType(null);

    setIsModalOpen(false);

    setModalView("rating");

    setDepartment("");

    setFocusDepartmentSection(true);

  };



  const scrollPageToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    mainScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exitDepartmentSelection = () => {

    setFocusDepartmentSection(false);

    scrollPageToTop();

  };







  const mediaRecorderRef = useRef<MediaRecorder | null>(null);



  const audioChunksRef = useRef<Blob[]>([]);



  const timerRef = useRef<NodeJS.Timeout | null>(null);



  const headerRef = useRef<HTMLElement>(null);



  const departmentsSectionRef = useRef<HTMLDivElement>(null);



  const mainScrollRef = useRef<HTMLElement>(null);



  const departmentClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);



  const [headerHeight, setHeaderHeight] = useState(0);



  /** After hospital rating: show department grid only (no title/intro) and scroll to it. */
  const [focusDepartmentSection, setFocusDepartmentSection] = useState(false);







  // Recording Timer Effect



  useEffect(() => {



    if (isRecording) {



      timerRef.current = setInterval(() => {



        setRecordingTime((prev) => prev + 1);



      }, 1000);



    } else {



      if (timerRef.current) {



        clearInterval(timerRef.current);



        timerRef.current = null;



      }



    }



    return () => {



      if (timerRef.current) {



        clearInterval(timerRef.current);



      }



    };



  }, [isRecording]);







  const isScrollLocked =



    isModalOpen || isIndividualModalOpen || isComplaintTypeModalOpen || focusDepartmentSection || Boolean(successTicketId);







  // Modal Lifecycle Effect — stable dependency array size (use isScrollLocked, not a growing dep list)



  useEffect(() => {



    if (isScrollLocked) {



      document.body.style.overflow = "hidden";



      if (isModalOpen) {



        setSelectedRating(0);



        setRatingFeedback("");



      }



    } else {



      document.body.style.overflow = "unset";



      setSelectedRating(0);



      setRatingFeedback("");



    }



    return () => {



      document.body.style.overflow = "unset";



    };



  }, [isScrollLocked, isModalOpen]);







  useEffect(() => {



    const el = headerRef.current;



    if (!el) return;



    const updateHeight = () => setHeaderHeight(el.getBoundingClientRect().height);



    updateHeight();



    const observer = new ResizeObserver(updateHeight);



    observer.observe(el);



    window.addEventListener("resize", updateHeight);



    return () => {



      observer.disconnect();



      window.removeEventListener("resize", updateHeight);



    };



  }, [lang, theme, isModalOpen, modalView, isIndividualModalOpen]);








  useEffect(() => {



    if (!focusDepartmentSection || successTicketId) return;



    const timer = window.setTimeout(() => {
      scrollPageToTop();
    }, 50);



    return () => window.clearTimeout(timer);



  }, [focusDepartmentSection, successTicketId]);

  useEffect(() => {
    if (errorMsg !== t.dailyRatingLimit) return;
    const timer = window.setTimeout(() => setErrorMsg(null), 5000);
    return () => window.clearTimeout(timer);
  }, [errorMsg, t.dailyRatingLimit]);

  const individualComplaintValidationError = (): string | null => {
    if (!indName.trim() && !indAppearance.trim()) return t.indRequiredFieldsError;
    if (!description.trim() && !audioBlob) return t.indRequiredFieldsError;
    if (
      !isAnonymous &&
      (!complainantName.trim() || !complainantPhone.trim() || !/^\d{10}$/.test(complainantPhone.trim()))
    ) {
      return t.indRequiredFieldsError;
    }
    return null;
  };

  const isBackendRequiredFieldsRejection = (message: string): boolean => {
    const lower = message.toLowerCase();
    return (
      lower.includes("written description") ||
      lower.includes("voice recording") ||
      lower.includes("description")
    );
  };

  useEffect(() => {
    if (!isIndividualModalOpen || !isIndividualComplaint) return;
    if (errorMsg !== t.indRequiredFieldsError) return;
    const timer = window.setTimeout(() => setErrorMsg(null), 2000);
    return () => window.clearTimeout(timer);
  }, [errorMsg, t.indRequiredFieldsError, isIndividualModalOpen, isIndividualComplaint]);







  // Hydrate rating progress from localStorage (avoids SSR/client mismatch flash)



  useEffect(() => {



    setHospitalRated(getHospitalRated());



    setRatedDepartments(new Set(getRatedDepartments()));



    kathmanduDateRef.current = getKathmanduDateString();



    setRatingHydrated(true);



  }, []);

  useEffect(() => {
    if (focusDepartmentSection || !ratingHydrated) {
      setSubtitle2RevealReady(false);
      return;
    }
    if (reduceMotion) {
      setSubtitle2RevealReady(true);
      return;
    }
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) {
          setSubtitle2RevealReady(true);
        }
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [focusDepartmentSection, ratingHydrated, reduceMotion]);

  // Reset rating eligibility when Kathmandu calendar day changes (e.g. tab left open overnight)



  useEffect(() => {



    if (!ratingHydrated) return;



    const syncDailyState = () => {



      const today = getKathmanduDateString();



      if (kathmanduDateRef.current !== null && kathmanduDateRef.current !== today) {



        setHospitalGateDismissed(false);



      }



      kathmanduDateRef.current = today;



      const state = loadDailyRatingState();



      setHospitalRated(state.hospital);



      setRatedDepartments(new Set(state.departments));



    };



    syncDailyState();



    const interval = window.setInterval(syncDailyState, 60_000);



    const onVisible = () => {



      if (document.visibilityState === "visible") syncDailyState();



    };



    document.addEventListener("visibilitychange", onVisible);



    return () => {



      window.clearInterval(interval);



      document.removeEventListener("visibilitychange", onVisible);



    };



  }, [ratingHydrated]);





  // Initialize theme based on preference or system



  useEffect(() => {



    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;



    if (savedTheme) {



      setTheme(savedTheme);



    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {



      setTheme("light");



    }



  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);







  const toggleTheme = () => {



    const nextTheme = theme === "dark" ? "light" : "dark";



    setTheme(nextTheme);



    localStorage.setItem("theme", nextTheme);



  };







  // Start Recording Audio



  const startRecording = async () => {



    try {



      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });



      const mediaRecorder = new MediaRecorder(stream);



      mediaRecorderRef.current = mediaRecorder;



      audioChunksRef.current = [];



      setRecordingTime(0);







      mediaRecorder.ondataavailable = (event) => {



        if (event.data.size > 0) {



          audioChunksRef.current.push(event.data);



        }



      };







      mediaRecorder.onstop = () => {



        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });



        const url = URL.createObjectURL(blob);



        setAudioBlob(blob);



        setAudioUrl(url);



      };







      mediaRecorder.start();



      setIsRecording(true);



      setErrorMsg(null);



    } catch (err) {



      setErrorMsg(t.voiceMicPermission);



    }



  };







  // Stop Recording Audio



  const stopRecording = () => {



    if (mediaRecorderRef.current && isRecording) {



      mediaRecorderRef.current.stop();



      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());



      setIsRecording(false);



      setRecordingTime(0);



    }



  };







  // Delete Voice File



  const deleteVoiceRecording = () => {



    setAudioBlob(null);



    setAudioUrl(null);



    audioChunksRef.current = [];



  };











  // Quick Rating Submit



  const clearDepartmentAfterDelay = () => {

    if (departmentClearTimerRef.current) {

      clearTimeout(departmentClearTimerRef.current);

    }

    departmentClearTimerRef.current = setTimeout(() => {

      setDepartment("");

      departmentClearTimerRef.current = null;

    }, 300);

  };



  const cancelDepartmentClearTimer = () => {

    if (departmentClearTimerRef.current) {

      clearTimeout(departmentClearTimerRef.current);

      departmentClearTimerRef.current = null;

    }

  };



  const handleQuickRatingSubmit = async (ratingValue: number, feedbackText: string = "") => {

    const dept = department;

    if (!dept) {

      return;

    }

    if (submitting) {

      return;

    }

    setRating(ratingValue);

    setSubmitting(true);

    setErrorMsg(null);

    try {

      const formData = new FormData();

      formData.append("is_rating_only", "true");

      formData.append("rating", ratingValue.toString());

      formData.append("department", dept);

      formData.append("description", feedbackText || "Direct rating submission");

      formData.append("is_anonymous", "true");

      formData.append("language", lang);

      const response = await apiClient.post<{ ticket_id: string }>("complaints", formData);

      if (!response?.ticket_id) {

        throw new Error("Invalid response from server");

      }

      markDepartmentRated(dept);

      setSuccessTicketId(response.ticket_id);

      setSuccessType("rating");

      setIsModalOpen(false);

      setSelectedRating(0);

      setRatingFeedback("");

    } catch (err) {

      if (isDailyRatingLimitError(err)) {

        markDepartmentRated(dept);

        setIsModalOpen(false);

        setErrorMsg(t.dailyRatingLimit);

      } else if (err instanceof ApiError) {

        setErrorMsg(`${err.status} ${err.statusText}: ${err.message}`);

      } else {

        setErrorMsg(err instanceof Error ? err.message : "Error submitting feedback.");

      }

    } finally {

      setSubmitting(false);

    }

  };



  const handleHospitalRatingHaveComplaint = (data: HospitalRatingPayload) => {
    setRating(data.rating);
    setSelectedRating(data.rating);
    setRatingFeedback(data.text);
    dismissHospitalGate();
    setIsModalOpen(false);
    setIsIndividualComplaint(false);
    setIsIndividualModalOpen(false);
    setIsComplaintTypeModalOpen(true);
  };

  const handleHospitalRatingSubmit = async (

    ratingValue: number,

    feedbackText: string,

  ) => {

    if (submitting) {

      return;

    }

    setRating(ratingValue);

    setSelectedRating(ratingValue);

    setSubmitting(true);

    setErrorMsg(null);

    try {

      const fd = new FormData();

      fd.append("is_rating_only", "true");

      fd.append("is_hospital_rating", "true");

      fd.append("rating", ratingValue.toString());

      fd.append("department", "Other");

      // When feedback is blank, send the sentinel so backend stores empty feedback.
      fd.append("description", feedbackText || "Direct rating submission");

      fd.append("is_anonymous", "true");

      fd.append("language", lang);

      const response = await apiClient.post<{ ticket_id: string }>("complaints", fd);

      if (!response?.ticket_id) {

        throw new Error("Invalid response from server");

      }

      setSuccessTicketId(response.ticket_id);

      setSuccessType("rating");

      setErrorMsg(null);

      confirmHospitalRatedToday();

    } catch (err) {

      if (isDailyRatingLimitError(err)) {

        setHospitalRatedPersisted();

        setErrorMsg(t.dailyRatingLimit);

      } else if (err instanceof ApiError) {

        setErrorMsg(`${err.status} ${err.statusText}: ${err.message}`);

      } else {

        setErrorMsg(err instanceof Error ? err.message : "Error submitting feedback.");

      }

    } finally {

      setSubmitting(false);

    }

  };







  // Handle Form Submission



  const handleSubmit = async (e: React.FormEvent) => {



    e.preventDefault();



    setErrorMsg(null);

    if (isIndividualComplaint) {
      const indValidationError = individualComplaintValidationError();
      if (indValidationError) {
        setErrorMsg(indValidationError);
        return;
      }
    } else if (!department.trim()) {
      const errorText =
        lang === "ne"
          ? "कृपया विभाग छान्नुहोस्।"
          : lang === "hi"
            ? "कृपया विभाग चुनें।"
            : "Please select a department.";
      setErrorMsg(errorText);
      return;
    }

    if (!isIndividualComplaint) {
      const hasDescriptionOrVoice = description.trim().length > 0 || audioBlob !== null;

      if (!hasDescriptionOrVoice) {
        setErrorMsg(t.validationError);
        return;
      }

      if (!isAnonymous) {
        if (!complainantName.trim() || !complainantPhone.trim() || !/^\d{10}$/.test(complainantPhone.trim())) {
          const errorText =
            lang === "ne"
              ? "कृपया आफ्नो नाम र १० अंकको फोन नम्बर प्रदान गर्नुहोस्।"
              : lang === "hi"
                ? "कृपया अपना नाम और 10 अंकों का फोन नंबर प्रदान करें।"
                : "Please provide your name and a 10-digit phone number.";
          setErrorMsg(errorText);
          return;
        }
      }
    }

    const complaintDescription = description;

    setSubmitting(true);







    try {



      const formData = new FormData();



      const ratingForSubmit = rating > 0 ? rating : 1;
      const departmentForSubmit = isIndividualComplaint
        ? (indDepartment.trim() || "Other")
        : department;

      formData.append("rating", ratingForSubmit.toString());

      formData.append("department", encodeURIComponent(departmentForSubmit));

      formData.append("description", complaintDescription);



      formData.append("is_anonymous", isAnonymous.toString());



      formData.append("language", lang);







      if (!isAnonymous) {



        formData.append("complainant_name", complainantName);



        formData.append("complainant_phone", complainantPhone);



      }



      if (patientId) {



        formData.append("patient_id", patientId);



      }







      if (isIndividualComplaint) {



        formData.append("is_individual_complaint", "True");



        if (indName.trim()) formData.append("ind_name", indName);



        if (indAppearance.trim()) formData.append("ind_appearance", indAppearance);



        if (indDepartment) formData.append("ind_department", indDepartment);



        if (indRole.trim()) formData.append("ind_role", indRole);



      }







      if (audioBlob) {



        formData.append("voice_file", audioBlob, "voice_complaint.webm");



      }







      if (attachment) {



        formData.append("attachment", attachment);



      }







      const response = await apiClient.post<{ ticket_id: string }>("complaints", formData);



      setSuccessTicketId(response.ticket_id);



      setSuccessType("complaint");

      setIsModalOpen(false);

      setIsIndividualModalOpen(false);

      setIsIndividualComplaint(false);

      setIsComplaintTypeModalOpen(false);

      cancelDepartmentClearTimer();



    } catch (err) {
      if (err instanceof ApiError) {
        if (isIndividualComplaint && isBackendRequiredFieldsRejection(err.message)) {
          setErrorMsg(t.indRequiredFieldsError);
        } else {
          setErrorMsg(`${err.status} ${err.statusText}: ${err.message}`);
        }
      } else {
        setErrorMsg(err instanceof Error ? err.message : "Error submitting feedback.");
      }



    } finally {



      setSubmitting(false);



    }



  };







  const handleResetForm = () => {



    setRating(5);



    setDepartment("");



    setDescription("");



    setIsAnonymous(false);



    setComplainantName("");



    setComplainantPhone("");



    setPatientId("");



    setAttachment(null);



    setIsIndividualComplaint(false);



    setIndName("");



    setIndAppearance("");



    setIndDepartment("");



    setIndRole("");



    setAudioBlob(null);



    setAudioUrl(null);



    setSuccessTicketId(null);



    setSuccessType(null);



    setErrorMsg(null);



    setIsModalOpen(false);



    setModalView("rating");



    setFocusDepartmentSection(false);



  };







  // Theme-specific CSS classes configuration



  const isDark = theme === "dark";

  const bodyBg = isDark ? "bg-slate-950 text-slate-100" : "bg-[#f4f7f6] text-slate-800";

  const headerBg = isDark ? "bg-slate-950/95 border-slate-700" : "bg-white border-slate-200";

  const glassPanel = isDark
    ? "bg-slate-800/70 border-slate-600 shadow-2xl shadow-black/40"
    : "bg-white border-slate-200/80 shadow-xl shadow-teal-900/5";

  const inputBg = isDark
    ? "bg-slate-800/60 border-slate-600 focus:border-teal-400 text-slate-50 placeholder:text-slate-400 shadow-inner backdrop-blur-sm"
    : "bg-white/80 border-slate-200/80 focus:border-teal-500 text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-teal-500/10 shadow-sm backdrop-blur-sm";

  const labelColor = isDark ? "text-slate-300" : "text-slate-700";

  const sectionTitleColor = isDark ? "text-white" : "text-slate-900";

  const textMuted = isDark ? "text-slate-400" : "text-slate-500";

  const modalCloseBtn = isDark
    ? "text-slate-400 hover:text-white hover:bg-slate-800/80"
    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100";

  const switchBg = isAnonymous
    ? (isDark ? "bg-teal-500" : "bg-teal-600")
    : (isDark ? "bg-slate-700" : "bg-slate-200");

  const formLabel = `block text-sm sm:text-[15px] font-semibold leading-snug ${isDark ? "text-slate-200" : "text-slate-700"}`;



  const formInput = `w-full px-4 py-3.5 rounded-xl border-2 text-base focus:outline-none transition-all duration-200 ${inputBg}`;



  const isDeptComplaintFormOpen =
    isModalOpen && modalView === "complaint" && !isIndividualComplaint;



  const isComplaintFormOpen = isDeptComplaintFormOpen || isIndividualModalOpen;

  const isPageScrollLocked = isComplaintFormOpen || focusDepartmentSection || Boolean(successTicketId);

  const useDocumentScroll = !isPageScrollLocked;

  // Homepage inline rating is the default entry; do not auto-open the hospital rating gate on load.
  const showHospitalRatingGate = false;

  const inlineRatingResetSignal = [
    isModalOpen,
    isComplaintTypeModalOpen,
    isIndividualModalOpen,
    focusDepartmentSection,
    successTicketId,
    showHospitalRatingGate,
  ].join("|");

  const isAnyModalOpen =
    isScrollLocked || showHospitalRatingGate;

  const modalPanelMaxHeight = "max-h-[min(calc(100dvh-10rem),720px)]";

  const headerZClass = "z-[130]";

  const isDailyRatingLimitMsg = errorMsg === t.dailyRatingLimit;



  return (



    <div className={`w-full min-w-0 max-w-full min-h-dvh transition-colors duration-300 flex flex-col font-sans relative overflow-x-hidden ${bodyBg} ${isPageScrollLocked ? "h-dvh max-h-dvh overflow-hidden" : ""}`}>

      {/* Daily rating limit — prominent readable alert (all languages) */}
      <AnimatePresence>
        {isDailyRatingLimitMsg && (
          <motion.div
            role="alert"
            aria-live="polite"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[125] w-[calc(100%-1.5rem)] max-w-lg pointer-events-auto"
          >
            <div
              className={`rounded-2xl border-2 px-5 py-4 sm:px-6 sm:py-5 shadow-2xl backdrop-blur-md ${
                isDark
                  ? "bg-gradient-to-br from-rose-950/95 via-rose-900/90 to-slate-900/95 border-rose-500/60 shadow-rose-950/50"
                  : "bg-gradient-to-br from-rose-50 via-white to-red-50 border-rose-400 shadow-rose-300/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                    isDark
                      ? "bg-rose-500/20 border border-rose-400/40"
                      : "bg-rose-100 border border-rose-300"
                  }`}
                >
                  <svg
                    className={`w-6 h-6 ${isDark ? "text-rose-400" : "text-rose-600"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <p
                  className={`flex-1 text-[0.9375rem] sm:text-base font-bold leading-[1.65] tracking-normal text-left ${
                    isDark ? "text-rose-100" : "text-rose-800"
                  }`}
                >
                  {errorMsg}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attractive Medical Watermarks and Ambient Lights — clipped to viewport */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">



      {isDark ? (



        <>



          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[130px] pointer-events-none" />



          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[130px] pointer-events-none" />



        </>



      ) : (



        <>



          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-[120px] pointer-events-none" />



          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-emerald-400/5 rounded-full blur-[120px] pointer-events-none" />



        </>



      )}







      {/* Grid Pattern depicting Hospital/Tech Site */}



      <div className={`absolute inset-0 pointer-events-none opacity-[0.02] ${isDark ? "bg-[radial-gradient(#14b8a6_1px,transparent_1px)]" : "bg-[radial-gradient(#0d9488_1.5px,transparent_1.5px)]"} [background-size:24px_24px]`} />












      {/* Visual Floating Medical plus symbols */}



      <div className="absolute top-24 left-10 opacity-[0.07] pointer-events-none">



        <svg className="w-12 h-12 text-teal-500" fill="currentColor" viewBox="0 0 24 24">



          <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />



        </svg>



      </div>



      <div className="absolute bottom-24 right-10 opacity-[0.05] pointer-events-none">



        <svg className="w-16 h-16 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">



          <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />



        </svg>



      </div>

      </div>





      {/* Header + language — scrollable when modal open; never covered by body overlay */}
      <div
        className={`w-full shrink-0 ${headerZClass} relative bg-inherit ${
          isAnyModalOpen
            ? `max-h-[min(42vh,320px)] overflow-y-auto overflow-x-hidden overscroll-y-contain border-b ${isDark ? "border-slate-700/40" : "border-slate-200/80"}`
            : "sticky top-0"
        }`}
      >
      <motion.header
        ref={headerRef}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`w-full border-b transition-colors duration-300 ${headerBg} relative`}



      >



        <div className="mx-auto px-4 sm:px-6 py-3 sm:py-4">



          {/* Top Row: Logo + Name on left, Theme toggle on right */}



          <div className="flex items-center justify-between gap-3">



            <motion.div



              initial={{ opacity: 0, x: -20 }}



              animate={{ opacity: 1, x: 0 }}



              transition={{ duration: 0.5, delay: 0.1 }}



              className="flex items-center gap-3 min-w-0"



            >



              <motion.div



                whileHover={{ scale: 1.05, rotate: 5 }}



                whileTap={{ scale: 0.95 }}



                className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/10"



              >



                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>



                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />



                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />



                </svg>



              </motion.div>



              <div className="min-w-0">



                <p className={`font-black text-base sm:text-lg leading-tight ${sectionTitleColor}`}>



                  {t.headerName}



                </p>



                <div className="flex items-center gap-1.5 mt-1">



                  <motion.span



                    animate={{ scale: [1, 1.2, 1] }}



                    transition={{ duration: 2, repeat: Infinity }}



                    className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"



                  />



                  <span className={`text-[11px] sm:text-sm font-semibold leading-tight ${isDark ? "text-teal-400/90" : "text-teal-700"}`}>



                    {t.headerTagline}



                  </span>



                </div>



              </div>



            </motion.div>







            <motion.button



              initial={{ opacity: 0, x: 20 }}



              animate={{ opacity: 1, x: 0 }}



              transition={{ duration: 0.5, delay: 0.2 }}



              whileHover={{ scale: 1.05 }}



              whileTap={{ scale: 0.95 }}



              onClick={toggleTheme}



              className={`p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${isDark



                ? "bg-slate-900 border-slate-700 text-amber-400 hover:text-amber-300 hover:shadow-lg hover:shadow-amber-500/20"



                : "bg-slate-100 border-slate-200 text-teal-700 hover:text-teal-950 hover:shadow-lg hover:shadow-teal-500/20"



                }`}



              aria-label="Toggle Theme"



            >



              <motion.div



                animate={{ rotate: isDark ? 0 : 360 }}



                transition={{ duration: 0.5 }}



              >



                {isDark ? (



                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>



                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 12.728l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />



                  </svg>



                ) : (



                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>



                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />



                  </svg>



                )}



              </motion.div>



            </motion.button>



          </div>







          {/* Language Selector Row */}



          <div className={`flex items-center justify-center gap-2.5 sm:gap-4 mt-4 sm:mt-5 pt-4 sm:pt-5 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>



            {(["ne", "hi", "en"] as LangKey[]).map((l) => (



              <button



                key={l}



                onClick={() => setLang(l)}



                className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer text-center border ${lang === l



                  ? (isDark



                    ? "bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 shadow-md shadow-teal-500/15 border-teal-400"



                    : "bg-teal-600 text-white shadow-md shadow-teal-600/10 border-teal-600")



                  : (isDark



                    ? "text-slate-200 group-hover:text-white bg-slate-800/80 border-slate-600 hover:border-teal-500/50 hover:bg-slate-800"



                    : "text-slate-500 hover:text-slate-800 bg-white border-slate-200 hover:border-slate-300")



                  }`}



              >



                <span className="flex items-center justify-center gap-1.5 sm:gap-2">



                  {l === "en" && (



                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 36 24">



                      <rect fill="#012169" width="36" height="24" />



                      <path d="M0 0l36 24M36 0L0 24" stroke="white" strokeWidth="4" />



                      <path d="M0 0l36 24M36 0L0 24" stroke="#C8102E" strokeWidth="2" />



                      <path d="M18 0v24M0 12h36" stroke="white" strokeWidth="6" />



                      <path d="M18 0v24M0 12h36" stroke="#C8102E" strokeWidth="4" />



                    </svg>



                  )}



                  {l === "ne" && (



                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="-17.582 -4.664 71.571 87.246">



                      <path d="M-15 37.574h60L-15 0v80h60l-60-60z" fill="#DC143C" stroke="#003893" strokeWidth="5.165" />



                      <path d="M-11.95 23.483a12.84 12.84 0 0023.9 0 11.95 11.95 0 01-23.9 0" fill="#fff" />



                      <g fill="#fff" transform="translate(0 29.045) scale(5.56106)">



                        <circle r="1" />



                        <g>



                          <g>



                            <path d="M.195-.98L0-1.39l-.195.408" transform="rotate(11.25)" />



                            <path d="M.195-.98L0-1.39l-.195.408" transform="rotate(22.5)" />



                            <path d="M.195-.98L0-1.39l-.195.408" transform="rotate(45)" />



                          </g>



                          <g transform="rotate(67.5)">



                            <path d="M.195-.98L0-1.39l-.195.408" transform="rotate(11.25)" />



                            <path d="M.195-.98L0-1.39l-.195.408" transform="rotate(22.5)" />



                            <path d="M.195-.98L0-1.39l-.195.408" transform="rotate(45)" />



                          </g>



                        </g>



                        <g transform="scale(-1 1)">



                          <g>



                            <path d="M.195-.98L0-1.39l-.195.408" transform="rotate(11.25)" />



                            <path d="M.195-.98L0-1.39l-.195.408" transform="rotate(22.5)" />



                            <path d="M.195-.98L0-1.39l-.195.408" transform="rotate(45)" />



                          </g>



                          <g transform="rotate(67.5)">



                            <path d="M.195-.98L0-1.39l-.195.408" transform="rotate(11.25)" />



                            <path d="M.195-.98L0-1.39l-.195.408" transform="rotate(22.5)" />



                            <path d="M.195-.98L0-1.39l-.195.408" transform="rotate(45)" />



                          </g>



                        </g>



                      </g>



                      <g fill="#fff" transform="matrix(8.1434 0 0 8.1434 0 58.787)">



                        <circle r="1" />



                        <g>



                          <g>



                            <path d="M.259.966L0 1.576l-.259-.61" />



                            <path d="M.259.966L0 1.576l-.259-.61" transform="rotate(180)" />



                          </g>



                          <g transform="rotate(90)">



                            <path d="M.259.966L0 1.576l-.259-.61" />



                            <path d="M.259.966L0 1.576l-.259-.61" transform="rotate(180)" />



                          </g>



                        </g>



                        <g transform="rotate(30)">



                          <g>



                            <path d="M.259.966L0 1.576l-.259-.61" />



                            <path d="M.259.966L0 1.576l-.259-.61" transform="rotate(180)" />



                          </g>



                          <g transform="rotate(90)">



                            <path d="M.259.966L0 1.576l-.259-.61" />



                            <path d="M.259.966L0 1.576l-.259-.61" transform="rotate(180)" />



                          </g>



                        </g>



                        <g transform="rotate(60)">



                          <g>



                            <path d="M.259.966L0 1.576l-.259-.61" />



                            <path d="M.259.966L0 1.576l-.259-.61" transform="rotate(180)" />



                          </g>



                          <g transform="rotate(90)">



                            <path d="M.259.966L0 1.576l-.259-.61" />



                            <path d="M.259.966L0 1.576l-.259-.61" transform="rotate(180)" />



                          </g>



                        </g>



                      </g>



                    </svg>



                  )}



                  {l === "hi" && (



                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 36 24">



                      <rect fill="#FF9933" width="36" height="8" />



                      <rect fill="#FFFFFF" y="8" width="36" height="8" />



                      <rect fill="#138808" y="16" width="36" height="8" />



                      <circle cx="18" cy="12" r="3" fill="#000080" />



                      <circle cx="18" cy="12" r="2" fill="none" stroke="#000080" strokeWidth="0.5" />



                    </svg>



                  )}



                  <span>{l === "en" ? "English" : l === "ne" ? "नेपाली" : "हिन्दी"}</span>



                </span>



              </button>



            ))}



          </div>



        </div>



      </motion.header>



      </div>

      {/* Page body — modals overlay this region only (header stays above) */}
      <div
        className={`relative flex-1 flex flex-col overflow-x-hidden isolate ${
          useDocumentScroll ? "" : "min-h-0"
        }`}
      >

      <main
        ref={mainScrollRef}
        aria-hidden={isAnyModalOpen}
        className={`relative w-full min-w-0 max-w-full mx-auto px-4 sm:px-6 lg:px-10 overflow-x-hidden ${
          isComplaintFormOpen
            ? "min-h-0 flex-1 flex flex-col py-0 overflow-hidden"
            : focusDepartmentSection
              ? "min-h-0 flex-1 overflow-y-auto overscroll-y-contain justify-start py-4 sm:py-6"
              : "pt-[max(1.25rem,env(safe-area-inset-top,0px))] sm:pt-8 md:pt-10 pb-8 sm:pb-12 flex flex-col justify-center"
        }`}
      >







        {/* MAIN VIEW - DEPARTMENTS */}



          <div className="space-y-8 animate-fade-in overflow-visible">



            {focusDepartmentSection && (



              <div className="flex justify-start w-full -mt-2 sm:mt-0">



                <motion.button



                  type="button"



                  whileHover={{ scale: 1.02 }}



                  whileTap={{ scale: 0.98 }}



                  onClick={exitDepartmentSelection}



                  aria-label={t.btnHome}



                  className={`inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-black tracking-wide transition-all cursor-pointer ${isDark ? "bg-slate-800/50 border-2 border-[#14b8a6] hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/20 text-slate-200 hover:text-slate-950" : "bg-slate-50 border-2 border-[#10b981] hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/20 text-slate-800 hover:text-white"}`}



                >



                  <motion.div



                    animate={{ rotate: [-10, 10, -10] }}



                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}



                    style={{ originY: 0.5, originX: 0.5 }}



                    className="inline-flex"



                  >



                    <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />



                  </motion.div>



                  <span>{t.btnHome}</span>



                </motion.button>



              </div>



            )}



            {!focusDepartmentSection && (



            <div className="space-y-5 sm:space-y-6 md:space-y-8 text-center sm:text-left overflow-visible pt-1 sm:pt-2 md:pt-3">



              <motion.h1
                initial={reduceMotion ? false : { opacity: 0, x: -28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: PORTAL_REVEAL_EASE }}
                className={`block overflow-visible pt-2 sm:pt-3 md:pt-4 pb-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-balance ${
                  isDark ? "portal-headline-gradient-dark hero-glow-dark" : "portal-headline-gradient-light hero-glow-light"
                }`}
              >



                {t.title}



              </motion.h1>



              <div
                className="max-w-4xl mx-auto sm:mx-0 space-y-4 sm:space-y-5 md:space-y-6"
                role="doc-subtitle"
              >
                {reduceMotion ? (
                  <p
                    className={`text-base sm:text-lg md:text-xl lg:text-2xl font-medium leading-relaxed sm:leading-loose text-pretty ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {t.portalSubtitle2}
                  </p>
                ) : !subtitle2RevealReady ? (
                  <p
                    className={`text-base sm:text-lg md:text-xl lg:text-2xl font-medium leading-relaxed sm:leading-loose text-pretty invisible ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                    aria-hidden="true"
                  >
                    {t.portalSubtitle2}
                  </p>
                ) : (
                  <motion.div
                    key="portal-subtitle-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, ease: PORTAL_REVEAL_EASE, delay: 0.32 }}
                    className="will-change-[opacity,transform]"
                  >
                    <p
                      className={`text-base sm:text-lg md:text-xl lg:text-2xl font-medium leading-relaxed sm:leading-loose text-pretty ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {t.portalSubtitle2}
                    </p>
                  </motion.div>
                )}
              </div>

              <HospitalRatingCard
                isDark={isDark}
                lang={lang}
                isRated={ratingHydrated && hospitalRated}
                ratedBadge={t.ratedBadge}
                scrollContainerRef={mainScrollRef}
                resetSignal={inlineRatingResetSignal}
                onSubmit={async (data) => {
                  await handleHospitalRatingSubmit(data.rating, data.text);
                }}
                onHaveComplaint={handleHospitalRatingHaveComplaint}
              />

            </div>



            )}







            {/* Department Selector */}



            <div ref={departmentsSectionRef} id="department-section" className="space-y-4">



              {!focusDepartmentSection && (



              <label className={`${formLabel} flex items-center justify-between`}>



                <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent tracking-tight">



                  {t.locationLabel}



                </span>



              </label>



              )}



              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">



                {Object.entries(t.locations).map(([key, val], index) => {



                  const isDeptRated = ratedDepartments.has(key);



                  return (



                  <motion.button



                    type="button"



                    key={key}



                    initial={{ opacity: 0, scale: 0.8 }}



                    animate={{ opacity: 1, scale: 1 }}



                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.05 }}



                    whileHover={{ scale: 1.05 }}



                    whileTap={{ scale: 0.95 }}



                    onClick={() => {

                      cancelDepartmentClearTimer();

                      setDepartment(key);

                      setModalView("rating");

                      setIsModalOpen(true);

                    }}



                    aria-label={isDeptRated ? `${val} — ${t.ratedBadge}` : val}



                    className={`group relative flex flex-col items-center justify-center gap-3 sm:gap-4 p-5 sm:p-6 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${

                      isDeptRated

                        ? isDark

                          ? "bg-slate-800/90 border-2 border-emerald-500/50 cursor-pointer"

                          : "bg-emerald-50/80 border-2 border-emerald-400/60 cursor-pointer"

                        : isDark

                          ? "bg-slate-800/90 border border-slate-600 hover:border-teal-500/60 hover:shadow-lg hover:shadow-teal-500/20 cursor-pointer"

                          : "bg-slate-50 hover:shadow-lg hover:shadow-teal-500/20 cursor-pointer"

                    }`}



                  >



                    {isDeptRated && (



                      <div className={`absolute top-2 right-2 z-30 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold shadow-md ${

                        isDark ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-emerald-100 text-emerald-800 border border-emerald-300"

                      }`}>



                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" aria-hidden />



                        <span>{t.ratedBadge}</span>



                      </div>



                    )}



                    {/* 1. Twinkling Teal Border — default state, hides on hover */}



                    <motion.div



                      className={`absolute inset-0 z-10 rounded-2xl pointer-events-none ${isDark

                          ? "border-2 border-[#14b8a6]"

                          : "border-2 border-[#10b981]"

                        }`}



                      style={{

                        animation: "border-twinkle 2.5s ease-in-out infinite"

                      }}



                      variants={{ hover: { opacity: 0, transition: { duration: 0.2 } } }}



                    />







                    {/* 2. Rotating Loading Border — shows ONLY on hovered button */}



                    <motion.div



                      className="absolute inset-[-100%] z-0 pointer-events-none"



                      initial={{ opacity: 0 }}



                      variants={{ hover: { opacity: 1, transition: { duration: 0.2 } } }}



                    >



                      <div

                        className="w-full h-full"

                        style={{

                          animation: "border-spin 2s linear infinite",

                          background: isDark

                            ? "conic-gradient(from 0deg, transparent 0deg 240deg, #14b8a6 280deg, #2dd4bf 320deg, #6ee7b7 340deg, transparent 360deg)"

                            : "conic-gradient(from 0deg, transparent 0deg 240deg, #10b981 280deg, #14b8a6 320deg, #34d399 340deg, transparent 360deg)"

                        }}

                      />



                    </motion.div>







                    {/* 3. Inner Mask with Diagonal Magic Shine inside */}



                    <div className={`absolute inset-[2px] z-[1] rounded-[14px] overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>



                      {/* Diagonal Magic Shine (Hover only) */}



                      <motion.div



                        className="absolute inset-0 z-10 overflow-hidden pointer-events-none rounded-[14px]"



                        initial={{ opacity: 0 }}



                        variants={{ hover: { opacity: 1, transition: { duration: 0.2 } } }}



                      >



                        <motion.div



                          className={`absolute -inset-[100%] w-[300%] h-[300%] blur-[1px] ${isDark



                              ? "bg-[linear-gradient(45deg,transparent_45%,rgba(71,85,105,0.05)_48.5%,rgba(100,116,139,0.12)_50%,rgba(71,85,105,0.05)_51.5%,transparent_55%)]"



                              : "bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.4)_48.5%,rgba(255,255,255,0.9)_50%,rgba(255,255,255,0.4)_51.5%,transparent_55%)]"



                            }`}



                          variants={{



                            hover: {



                              x: ["-35%", "35%"],



                              y: ["-35%", "35%"],



                              transition: { duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.4 }



                            }



                          }}



                        />



                      </motion.div>



                    </div>







                    {/* Icon with Spring Bounce */}



                    <motion.div



                      className={`relative z-20 flex items-center justify-center ${getDepartmentGridIconSizeClass(key)} ${isDark ? "opacity-90" : "opacity-80"}`}



                      variants={{ hover: { y: -4, scale: 1.15, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 10 } } }}



                    >



                      <DepartmentIcon department={key} />



                    </motion.div>







                    {/* Text Color using pure Tailwind so no buttons become invisible */}



                    <span



                      className={`relative z-20 text-xs sm:text-[13px] font-bold leading-snug transition-colors duration-300 ${isDark

                          ? "text-slate-200 group-hover:text-teal-300"

                          : "text-slate-600 group-hover:text-[#10b981]"



                        }`}



                    >



                      {val}



                    </span>



                  </motion.button>



                );



                })}



              </div>



            </div>








          </div>

      </main>







      {/* Department Complaint Form — same ModalShell backdrop as complaint success */}
      <AnimatePresence>
        {isDeptComplaintFormOpen && (
          <div className="absolute inset-0" style={{ zIndex: Z_MODAL_BACKDROP }}>
            <ModalShell
              onBackdropClick={() => {
                setIsModalOpen(false);
                clearDepartmentAfterDelay();
              }}
              panelClassName="max-w-2xl w-full"
              topOffsetPx={headerHeight}
            >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
                    className={`w-full ${modalPanelMaxHeight} rounded-3xl shadow-2xl border scrollbar-hide transition-colors duration-300 overflow-y-auto ${isDark ? "bg-slate-900 border-slate-600" : "bg-white border-slate-200"}`}
                  >
                    <div className="p-6 sm:p-8 pt-4 sm:pt-6">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setIsModalOpen(false);
                            clearDepartmentAfterDelay();
                          }}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${isDark ? "bg-slate-800/60 border-slate-600 text-slate-200 hover:bg-slate-800" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="animate-fade-in">
                        <div className="flex flex-col items-start gap-3 border-b pb-4 border-slate-200/20 mt-0">
                          <h2 className={`text-xl sm:text-2xl md:text-3xl font-black ${sectionTitleColor}`}>
                            {t.submitComplaint}



                            </h2>



                            <div className="w-full">



                              <CustomDepartmentSelect



                                value={department}



                                onChange={setDepartment}



                                options={Object.entries(t.locations) as [string, string][]}



                                isDark={isDark}



                                placeholder={`-- ${t.locationSelect} --`}



                              />



                            </div>



                          </div>







                          <form onSubmit={handleSubmit} className={`p-5 sm:p-8 rounded-3xl border space-y-6 transition-colors ${glassPanel}`}>







                            {/* Patient Rating Indicator */}



                            {/* <div className={`p-5 rounded-2xl border space-y-3 ${isDark ? "bg-slate-800/70 border-slate-600/60" : "bg-slate-50/70 border-slate-200/60"}`}>



                <label className={`${formLabel}`}>



                  {t.ratingLabel} <span className="text-rose-500">*</span>



                </label>



                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">



                  <div className="flex gap-3 sm:gap-4 flex-1 justify-center sm:justify-start">



                    {[1, 2, 3, 4, 5].map((star) => (



                      <button



                        type="button"



                        key={star}



                        onClick={() => setRating(star)}



                        onMouseEnter={() => setHoverRating(star)}



                        onMouseLeave={() => setHoverRating(0)}



                        className="w-12 h-12 sm:w-16 sm:h-16 transition-transform duration-700 hover:scale-110 cursor-pointer"



                        aria-label={`Rating ${star}`}



                      >



                        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">



                          <path



                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"



                            fill={star <= (hoverRating || rating) ? "#FBBF24" : "none"}



                            stroke={star <= (hoverRating || rating) ? "#F59E0B" : (isDark ? "#475569" : "#CBD5E1")}



                            strokeWidth={2}



                            strokeLinecap="round"



                            strokeLinejoin="round"



                            className={star <= (hoverRating || rating) ? "drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" : ""}



                          />



                        </svg>



                      </button>



                    ))}



                  </div>



                  <span className={`text-sm font-semibold ${isDark ? "text-teal-400" : "text-teal-700"}`}>



                    {t.ratingDescription[hoverRating || rating]}



                  </span>



                </div>



              </div> */}







                            {/* HTML5 Voice Recording Support */}



                            <div className={`p-5 rounded-2xl border space-y-0 ${isDark ? "bg-slate-800/70 border-slate-600/60" : "bg-slate-50/70 border-slate-200/60"}`}>



                              <label className={`${formLabel} mb-3`}>



                                {t.voiceLabel}



                              </label>







                              <div className="flex flex-wrap items-center gap-3">



                                {!audioUrl ? (



                                  <button



                                    type="button"



                                    onClick={isRecording ? stopRecording : startRecording}



                                    className={`px-4 py-3.5 rounded-xl text-sm font-semibold tracking-wide cursor-pointer transition-all flex items-center gap-2 ${isRecording



                                      ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/10"



                                      : (isDark



                                        ? "bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-600"



                                        : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm")



                                      }`}



                                  >



                                    {isRecording ? (



                                      <>



                                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />



                                        <span>{t.voiceRecordStop}</span>



                                        <span className="ml-2 font-mono text-sm font-bold bg-white/30 px-3 py-1 rounded-full">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>



                                      </>



                                    ) : (



                                      <>



                                        <svg className="w-5 h-5 text-teal-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>



                                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />



                                        </svg>



                                        {t.voiceRecordStart}



                                      </>



                                    )}



                                  </button>



                                ) : (



                                  <div className={`flex items-center gap-4 w-full p-3 rounded-xl border-2 transition-colors ${isDark ? "bg-slate-900 border-slate-700" : "bg-slate-100 border-slate-200"}`}>



                                    <audio src={audioUrl} controls className="h-9 flex-1" />



                                    <button



                                      type="button"



                                      onClick={deleteVoiceRecording}



                                      className="text-xs text-rose-500 hover:text-rose-400 font-bold px-3 py-1 cursor-pointer"



                                    >



                                      {t.voiceDelete}



                                    </button>



                                  </div>



                                )}







                                {isRecording && (



                                  <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border animate-pulse ${isDark ? "bg-slate-900 border-slate-600" : "bg-white border-slate-200"}`}>



                                    <span className="w-1.5 h-4 bg-teal-500 rounded-full inline-block animate-[bounce_0.6s_infinite]" />



                                    <span className="w-1.5 h-6 bg-teal-500 rounded-full inline-block animate-[bounce_0.6s_infinite_0.1s]" />



                                    <span className="w-1.5 h-3 bg-teal-500 rounded-full inline-block animate-[bounce_0.6s_infinite_0.2s]" />



                                    <span className="w-1.5 h-5 bg-teal-500 rounded-full inline-block animate-[bounce_0.6s_infinite_0.3s]" />



                                  </div>



                                )}



                              </div>



                            </div>







                            {/* Text Description Box */}



                            <div className="space-y-2">



                              <label htmlFor="description" className={formLabel}>



                                {t.descriptionLabel} {!audioBlob && <span className="text-red-500 ml-1">*</span>}



                              </label>



                              <textarea



                                id="description"



                                rows={4}



                                value={description}



                                onChange={(e) => setDescription(e.target.value)}



                                placeholder={t.descriptionPlaceholder}



                                className={formInput}



                              />



                            </div>

















                            {/* Anonymity Selector Widget */}



                            <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${isDark ? "bg-slate-800/70 border-slate-600/80 backdrop-blur-md shadow-lg shadow-slate-900/20" : "bg-white/60 border-slate-200/80 backdrop-blur-md shadow-lg shadow-slate-200/50"}`}>



                              <div className="flex items-center gap-2">



                                <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>



                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />



                                </svg>



                                <div>



                                  <span className={`block text-base font-semibold ${sectionTitleColor}`}>{t.anonymousLabel}</span>



                                  <span className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{isAnonymous ? t.anonymousYes : t.anonymousNo}</span>



                                </div>



                              </div>



                              <button



                                type="button"



                                onClick={() => setIsAnonymous(!isAnonymous)}



                                className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer ${switchBg}`}



                              >



                                <span



                                  className={`absolute top-1 left-1 w-6 h-6 rounded-full transition-transform ${isAnonymous ? "translate-x-6 bg-slate-900" : "translate-x-0 bg-white shadow-md"



                                    }`}



                                />



                              </button>



                            </div>







                            {/* Complainant Contact Fields */}



                            {!isAnonymous && (



                              <div className={`p-5 rounded-2xl border space-y-4 animate-fade-in ${isDark ? "bg-slate-800/70 border-slate-600" : "bg-slate-50 border-slate-200"}`}>



                                <h3 className={`text-sm sm:text-base font-semibold pb-2 border-b ${isDark ? "text-white border-slate-700" : "text-slate-900 border-slate-200"}`}>



                                  {t.contactSection}



                                </h3>



                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">



                                  <div className="space-y-1.5">



                                    <label htmlFor="name" className={formLabel}>{t.nameLabel} <span className="text-rose-500">*</span></label>



                                    <input



                                      id="name"



                                      type="text"



                                      value={complainantName}



                                      onChange={(e) => setComplainantName(e.target.value)}



                                      className={formInput}



                                    />



                                  </div>



                                  <div className="space-y-1.5">



                                    <label htmlFor="phone" className={formLabel}>{t.phoneLabel} <span className="text-rose-500">*</span></label>



                                    <input



                                      id="phone"



                                      type="tel"



                                      maxLength={10}



                                      pattern="\d{10}"



                                      onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}



                                      value={complainantPhone}



                                      onChange={(e) => setComplainantPhone(e.target.value.replace(/\D/g, ''))}



                                      placeholder={t.phonePlaceholder}



                                      className={formInput}



                                    />



                                  </div>



                                </div>



                                <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t.phoneHelp}</p>



                              </div>



                            )}







                            {/* Patient EMR ID */}



                            <div className="space-y-2">



                              <label htmlFor="patientId" className={formLabel}>



                                {t.patientIdLabel}



                              </label>



                              <input



                                id="patientId"



                                type="text"



                                value={patientId}



                                onChange={(e) => setPatientId(e.target.value)}



                                placeholder={t.patientIdPlaceholder}



                                className={formInput}



                              />



                            </div>







                            {/* File Attachment Upload */}



                            <div className="space-y-2">



                              <label htmlFor="attachment" className={`${formLabel} flex items-center gap-2`}>



                                <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>



                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />



                                </svg>



                                {t.attachmentLabel}



                              </label>



                              <div className="relative group cursor-pointer">



                                <input



                                  id="attachment"



                                  type="file"



                                  accept="image/*,video/*,application/pdf"



                                  onChange={(e) => {



                                    if (e.target.files && e.target.files[0]) {



                                      setAttachment(e.target.files[0]);



                                    }



                                  }}



                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"



                                />



                                <div className={`w-full px-4 py-4 rounded-xl border border-dashed transition-all text-sm flex items-center justify-between ${isDark



                                  ? "border-slate-700 bg-slate-900/20 group-hover:bg-slate-900/30 text-slate-300"



                                  : "border-slate-300 bg-[#fbfdfd] group-hover:bg-slate-50 text-slate-500"



                                  }`}>



                                  <span className="truncate">



                                    {attachment ? attachment.name : t.chooseFilePlaceholder}



                                  </span>



                                  <svg className={`w-5 h-5 transition-colors ${isDark ? "text-teal-400 group-hover:text-teal-300" : "text-teal-600 group-hover:text-teal-700"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>



                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />



                                  </svg>



                                </div>



                              </div>



                            </div>







                            {/* Form Validation Errors banner */}



                            {errorMsg && !isDailyRatingLimitMsg && (



                              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-start gap-3 animate-pulse">



                                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>



                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />



                                </svg>



                                <span className="leading-relaxed font-semibold">{errorMsg}</span>



                              </div>



                            )}







                            {/* Submit Button */}
                            <button



                              type="submit"



                              disabled={submitting}



                              className={`w-full py-4 rounded-xl font-black text-base tracking-wide uppercase transition-all disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer ${isDark



                                ? "bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 shadow-xl shadow-teal-500/10"



                                : "bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-600/10"



                                }`}



                            >



                              {submitting ? (



                                <>



                                  <div className={`w-4 h-4 border-2 rounded-full animate-spin ${isDark ? "border-slate-950 border-t-transparent" : "border-white border-t-transparent"}`} />



                                  {t.btnSubmitting}



                                </>



                              ) : (



                                <>



                                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />



                                  {t.btnSubmit}



                                </>



                              )}



                            </button>




                          </form>



                        </div>



                    </div>



                  </motion.div>

            </ModalShell>
          </div>
        )}
      </AnimatePresence>

      {/* Individual Complaint Form — same ModalShell backdrop as complaint success */}
      <AnimatePresence>
        {isIndividualModalOpen && isIndividualComplaint && (
          <div className="absolute inset-0" style={{ zIndex: Z_MODAL_BACKDROP }}>
            <ModalShell
              onBackdropClick={() => {
                setIsIndividualModalOpen(false);
                setIsIndividualComplaint(false);
              }}
              panelClassName="max-w-2xl w-full"
              topOffsetPx={headerHeight}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
                className={`w-full ${modalPanelMaxHeight} overflow-y-auto rounded-3xl shadow-2xl border scrollbar-hide transition-colors duration-300 ${isDark ? "bg-slate-900 border-slate-600" : "bg-white border-slate-200"}`}
              >
                {/* Modal Content */}
                <div className="p-6 sm:p-8">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsIndividualModalOpen(false);
                        setIsIndividualComplaint(false);
                      }}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${isDark ? "bg-slate-800/60 border-slate-600 text-slate-200 hover:bg-slate-800" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
                    {t.btnIndividualComplaint}
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="indModalName" className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {t.indNameLabel}
                      </label>
                      <input
                        id="indModalName"
                        type="text"
                        value={indName}
                        onChange={(e) => setIndName(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${isDark ? "bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"}`}
                        placeholder={t.indNameLabel}
                      />
                    </div>

                    {/* Position/Role */}
                    <div className="space-y-1.5">
                      <label htmlFor="indModalRole" className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {t.indRoleLabel}
                      </label>
                      <input
                        id="indModalRole"
                        type="text"
                        value={indRole}
                        onChange={(e) => setIndRole(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${isDark ? "bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"}`}
                        placeholder={t.indRoleLabel}
                      />
                    </div>

                    {/* Department (Optional) */}
                    <div className="space-y-1.5">
                      <label htmlFor="indModalDepartment" className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {t.locationLabel}
                      </label>
                      <CustomDepartmentSelect
                        value={indDepartment}
                        onChange={setIndDepartment}
                        options={Object.entries(t.locations)}
                        isDark={isDark}
                        placeholder={`-- ${t.locationSelect} --`}
                      />
                    </div>

                    {/* Appearance (when name not provided) */}
                    {!indName && (
                      <div className="space-y-1.5">
                        <label htmlFor="indModalAppearance" className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          {t.indAppearanceLabel}
                        </label>
                        <textarea
                          id="indModalAppearance"
                          rows={2}
                          value={indAppearance}
                          onChange={(e) => setIndAppearance(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${isDark ? "bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"}`}
                          placeholder={t.indAppearanceLabel}
                        />
                      </div>
                    )}

                    {/* Complaint Description */}
                    <div className="space-y-2">
                      <label htmlFor="indModalDescription" className={formLabel}>
                        {t.descriptionLabel} {!audioBlob && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <textarea
                        id="indModalDescription"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t.descriptionPlaceholder}
                        className={formInput}
                      />
                    </div>

                    {/* Anonymous Toggle */}
                    <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${isDark ? "bg-slate-800/70 border-slate-600/80 backdrop-blur-md shadow-lg shadow-slate-900/20" : "bg-white/60 border-slate-200/80 backdrop-blur-md shadow-lg shadow-slate-200/50"}`}>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <div>
                          <span className={`block text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{t.anonymousLabel}</span>
                          <span className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{isAnonymous ? t.anonymousYes : t.anonymousNo}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAnonymous(!isAnonymous)}
                        className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer ${isAnonymous
                          ? (isDark ? "bg-teal-500" : "bg-teal-600")
                          : (isDark ? "bg-slate-700" : "bg-slate-200")
                          }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-6 h-6 rounded-full transition-transform ${isAnonymous ? "translate-x-6 bg-slate-900" : "translate-x-0 bg-white shadow-md"
                            }`}
                        />
                      </button>
                    </div>

                    {/* Contact Details (when not anonymous) */}
                    {!isAnonymous && (
                      <>
                        <div
                          className={`p-5 rounded-2xl border space-y-4 animate-fade-in ${
                            isDark ? "bg-slate-800/70 border-slate-600" : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <h3
                            className={`text-sm sm:text-base font-semibold pb-2 border-b ${
                              isDark ? "text-white border-slate-700" : "text-slate-900 border-slate-200"
                            }`}
                          >
                            {t.contactSection}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label htmlFor="indModalComplainantName" className={formLabel}>
                                {t.nameLabel} <span className="text-rose-500">*</span>
                              </label>
                              <input
                                id="indModalComplainantName"
                                type="text"
                                value={complainantName}
                                onChange={(e) => setComplainantName(e.target.value)}
                                className={formInput}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label htmlFor="indModalContact" className={formLabel}>
                                {t.phoneLabel} <span className="text-rose-500">*</span>
                              </label>
                              <input
                                id="indModalContact"
                                type="tel"
                                maxLength={10}
                                pattern="\d{10}"
                                onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                                value={complainantPhone}
                                onChange={(e) => setComplainantPhone(e.target.value.replace(/\D/g, ""))}
                                placeholder={t.phonePlaceholder}
                                className={formInput}
                              />
                            </div>
                          </div>
                          <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            {t.phoneHelp}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="indModalEmrId" className={formLabel}>
                            {t.patientIdLabel}
                          </label>
                          <input
                            id="indModalEmrId"
                            type="text"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            placeholder={t.patientIdPlaceholder}
                            className={formInput}
                          />
                        </div>
                      </>
                    )}

                    {/* File Upload */}
                    <div className="space-y-2">
                      <label htmlFor="indModalFile" className={`${formLabel} flex items-center gap-2`}>
                        <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {t.attachmentLabel}
                      </label>
                      <div className="relative group cursor-pointer">
                        <input
                          id="indModalFile"
                          type="file"
                          accept="image/*,video/*,application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setAttachment(e.target.files[0]);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                          className={`w-full px-4 py-4 rounded-xl border border-dashed transition-all text-sm flex items-center justify-between ${
                            isDark
                              ? "border-slate-700 bg-slate-900/20 group-hover:bg-slate-900/30 text-slate-300"
                              : "border-slate-300 bg-[#fbfdfd] group-hover:bg-slate-50 text-slate-500"
                          }`}
                        >
                          <span className="truncate">
                            {attachment ? attachment.name : t.chooseFilePlaceholder}
                          </span>
                          <svg
                            className={`w-5 h-5 transition-colors shrink-0 ${
                              isDark ? "text-teal-400 group-hover:text-teal-300" : "text-teal-600 group-hover:text-teal-700"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Form Validation Errors */}
                    {errorMsg && !isDailyRatingLimitMsg && (
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-start gap-3 animate-pulse">
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="leading-relaxed font-semibold">{errorMsg}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className={`w-full py-4 rounded-xl font-black text-base tracking-wide uppercase transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer ${isDark
                        ? "bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 shadow-xl shadow-teal-500/10"
                        : "bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-600/10"
                        }`}
                    >
                      <Send className="w-4 h-4" />
                      {t.btnSubmit}
                    </button>
                  </form>
                </div>
              </motion.div>
            </ModalShell>
          </div>
        )}
      </AnimatePresence>

      {/* Select Complaint Type — same ModalShell backdrop as complaint success */}
      <AnimatePresence>
        {isComplaintTypeModalOpen && (
          <div className="absolute inset-0" style={{ zIndex: Z_MODAL_BACKDROP }}>
            <ModalShell
              onBackdropClick={() => setIsComplaintTypeModalOpen(false)}
              panelClassName="max-w-2xl w-full"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
                className={`w-full ${modalPanelMaxHeight} overflow-y-auto rounded-3xl shadow-2xl border scrollbar-hide transition-colors duration-300 ${isDark ? "bg-slate-900 border-slate-600" : "bg-white border-slate-200"}`}
              >
                {/* Close button */}
                <button
                  onClick={() => setIsComplaintTypeModalOpen(false)}
                  className={`absolute top-4 right-4 p-2 rounded-full hover:bg-slate-500/10 transition-colors z-10 ${isDark ? "text-slate-400 hover:text-white hover:bg-slate-800/80" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Modal Content */}
                <div className="p-6 sm:p-8">
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
                    {t.selectComplaintType}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Department Complaint Card */}
                    <motion.button
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsComplaintTypeModalOpen(false);
                        setIsIndividualComplaint(false);
                        setIsIndividualModalOpen(false);
                        setFocusDepartmentSection(false);
                        setModalView("complaint");
                        setIsModalOpen(true);
                      }}
                      className={`p-6 rounded-2xl border-2 transition-all cursor-pointer text-left group ${isDark
                        ? "bg-slate-800/50 border-[#14b8a6] hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/20 hover:text-white text-slate-100"
                        : "bg-slate-50 border-[#10b981] hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/20 hover:text-white text-slate-900"
                        }`}
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`p-3 rounded-xl transition-colors group-hover:scale-110 ${isDark ? "bg-teal-500/20 text-teal-400 group-hover:bg-white/20 group-hover:text-white" : "bg-teal-100 text-teal-600 group-hover:bg-white/20 group-hover:text-white"}`}>
                          <Building2 className="w-6 h-6" />
                        </div>
                        <h3 className={`text-lg font-bold transition-colors ${isDark ? "text-white" : "text-slate-900"} group-hover:text-white`}>
                          {t.departmentComplaint}
                        </h3>
                      </div>
                      <p className={`text-sm transition-colors ${isDark ? "text-slate-300" : "text-slate-600"} group-hover:text-white`}>
                        {t.departmentComplaintDesc}
                      </p>
                    </motion.button>

                    {/* Individual Complaint Card */}
                    <motion.button
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsComplaintTypeModalOpen(false);
                        setIsModalOpen(false);
                        setModalView("rating");
                        setDepartment("");
                        setIsIndividualComplaint(true);
                        setIsIndividualModalOpen(true);
                      }}
                      className={`p-6 rounded-2xl border-2 transition-all cursor-pointer text-left group ${isDark
                        ? "bg-slate-800/50 border-[#14b8a6] hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/20 hover:text-white text-slate-100"
                        : "bg-slate-50 border-[#10b981] hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/20 hover:text-white text-slate-900"
                        }`}
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`p-3 rounded-xl transition-colors group-hover:scale-110 ${isDark ? "bg-teal-500/20 text-teal-400 group-hover:bg-white/20 group-hover:text-white" : "bg-teal-100 text-teal-600 group-hover:bg-white/20 group-hover:text-white"}`}>
                          <User className="w-6 h-6" />
                        </div>
                        <h3 className={`text-lg font-bold transition-colors ${isDark ? "text-white" : "text-slate-900"} group-hover:text-white`}>
                          {t.individualComplaint}
                        </h3>
                      </div>
                      <p className={`text-sm transition-colors ${isDark ? "text-slate-300" : "text-slate-600"} group-hover:text-white`}>
                        {t.individualComplaintDesc}
                      </p>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </ModalShell>
          </div>
        )}
      </AnimatePresence>

      {/* Department rating — same ModalShell backdrop as complaint success */}
      {isModalOpen && modalView === "rating" && department && !isComplaintTypeModalOpen && (
        <div className="absolute inset-0" style={{ zIndex: Z_MODAL_BACKDROP }}>
          <HospitalRatingModal
            isDark={isDark}
            lang={lang}
            topOffsetPx={headerHeight}
            title={t.ratingLabel}
            headerExtra={
              <span
                className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold ${
                  isDark
                    ? "bg-slate-800/90 border border-slate-600 text-slate-100 shadow-md"
                    : "bg-slate-50 border border-slate-200 text-slate-700 shadow-sm"
                }`}
              >
                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-lg shrink-0 ${
                    isDark
                      ? "bg-slate-700/80 border border-slate-600"
                      : "bg-white border border-slate-200 shadow-sm"
                  }`}
                >
                  <DepartmentIcon department={department} className="w-5 h-5" />
                </span>
                {t.locations[department as keyof typeof t.locations] || department}
              </span>
            }
            onSubmit={async (data) => {
              await handleQuickRatingSubmit(data.rating, data.text);
            }}
            onHaveComplaint={(data) => {
              setRating(data.rating);
              setSelectedRating(data.rating);
              setRatingFeedback(data.text);
              setIsIndividualComplaint(false);
              setIsIndividualModalOpen(false);
              setIsComplaintTypeModalOpen(true);
            }}
            onClose={() => {
              setIsModalOpen(false);
              clearDepartmentAfterDelay();
            }}
          />
        </div>
      )}

      {/* Success overlay — content region only */}
      <AnimatePresence>
        {successTicketId && (
          <div className="absolute inset-0" style={{ zIndex: Z_MODAL_BACKDROP }}>
          <ModalShell panelClassName="max-w-2xl w-full">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="success-dialog-title"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
              className={`w-full min-h-0 h-auto ${modalPanelMaxHeight} overflow-y-auto overflow-x-hidden rounded-3xl shadow-2xl border scrollbar-hide transition-colors duration-300 ${isDark ? "bg-slate-900 border-slate-600" : "bg-white border-slate-200"}`}
            >
              <div className="pt-4 pb-2 px-6 sm:p-8 text-center space-y-4 sm:space-y-6 min-w-0">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
                  <div className="absolute inset-2 rounded-full bg-emerald-500/30 animate-pulse"></div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/5 animate-pulse">
                    <motion.div animate={{ rotate: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} style={{ originY: 0.5, originX: 0.5 }}>
                      <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  </div>
                </div>

                {successType === "rating" ? (
                  <div className="space-y-2 py-2 sm:space-y-4 sm:py-4">
                    <h2 id="success-dialog-title" className={`text-2xl sm:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{t.ratingSuccessTitle}</h2>
                    <p className={`text-lg font-bold mb-0 sm:mb-2 ${isDark ? "text-teal-400" : "text-teal-600"}`}>{t.welcomeText}</p>
                    <p className={`text-base leading-relaxed ${labelColor}`}>{t.ratingSuccessText}</p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6 min-w-0">
                    <div className="space-y-2">
                      <h2 id="success-dialog-title" className={`text-2xl font-black ${sectionTitleColor}`}>{t.successTitle}</h2>
                      <p className={`text-lg font-bold mb-0 sm:mb-2 ${isDark ? "text-teal-400" : "text-teal-600"}`}>{t.welcomeText}</p>
                      <p className={`text-sm leading-relaxed ${labelColor}`}>{t.successText}</p>
                    </div>
                    <div className={`py-4 px-6 sm:p-8 rounded-2xl border block w-full min-w-0 transition-colors ${isDark ? "bg-slate-800/90 border-slate-600" : "bg-white border-slate-200 shadow-xl shadow-slate-200/50"}`}>
                      <div className={`text-xs sm:text-sm uppercase tracking-widest font-bold mb-1 sm:mb-3 ${textMuted}`}>{t.ticketLabel}</div>
                      <div className={`text-2xl sm:text-4xl font-mono font-black py-2 sm:py-4 px-3 rounded-xl select-all break-all my-2 sm:my-4 shadow-inner ${isDark ? "text-teal-300 bg-teal-950/50 border border-teal-700/60" : "text-teal-600 bg-teal-50 border border-teal-100"}`}>
                        {successTicketId}
                      </div>
                      <div className={`text-sm sm:text-base font-bold mt-4 sm:mt-6 max-w-md mx-auto leading-relaxed py-2 px-4 sm:p-4 rounded-xl flex items-center gap-3 text-left shadow-sm ${isDark ? "bg-rose-950/40 text-rose-300 border border-rose-800/60 shadow-rose-500/10" : "bg-rose-50 text-rose-600 border border-rose-200 shadow-rose-500/10"}`}>
                        <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{t.ticketHelp}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-0 sm:pt-2">
                  {successType === "rating" && hasUnratedDepartment && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={goToDepartmentSelection}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold tracking-wide transition-all cursor-pointer text-sm sm:text-base ${isDark ? "bg-slate-800/50 border-2 border-slate-600 text-slate-200 hover:bg-gradient-to-r hover:from-teal-500 hover:to-emerald-400 hover:border-teal-500 hover:text-slate-950 hover:shadow-lg hover:shadow-teal-500/10" : "bg-slate-100 border-2 border-slate-300 text-slate-700 hover:bg-teal-600 hover:border-teal-600 hover:text-white hover:shadow-lg hover:shadow-teal-600/20"}`}
                    >
                      <motion.div animate={{ rotate: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} style={{ originY: 0.5, originX: 0.5 }}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </motion.div>
                      {ratedDepartments.size === 0 ? t.rateDepartments : t.rateOtherDepartment}
                    </motion.button>
                  )}
                  <button
                    onClick={handleResetForm}
                    className={`flex-1 sm:flex-none px-4 sm:px-8 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-black tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] ${
                      isDark
                        ? "bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 shadow-lg shadow-teal-500/10"
                        : "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/10"
                    }`}
                  >
                    <motion.div animate={{ rotate: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} style={{ originY: 0.5, originX: 0.5 }}>
                      <HomeIcon className="w-5 h-5" />
                    </motion.div>
                    {t.btnHome}
                  </button>
                </div>
              </div>
            </motion.div>
          </ModalShell>
          </div>
        )}
      </AnimatePresence>

      {showHospitalRatingGate && (
        <div className="absolute inset-0" style={{ zIndex: Z_MODAL_BACKDROP }}>
        <HospitalRatingModal
          isDark={isDark}
          lang={lang}
          topOffsetPx={headerHeight}
          onSubmit={async (data) => {
            await handleHospitalRatingSubmit(data.rating, data.text);
          }}
          onHaveComplaint={handleHospitalRatingHaveComplaint}
          onClose={dismissHospitalGate}
        />
        </div>
      )}

      </div>

      {/* Hospital Footer */}
      {!isAnyModalOpen && !focusDepartmentSection && !successTicketId && (



      <footer className={`border-t py-8 text-center text-xs sm:text-sm font-semibold transition-colors duration-300 ${isDark ? "border-slate-700 bg-slate-950 text-slate-400" : "border-slate-200 bg-white text-slate-600"



        }`}>



        <p>&copy; {new Date().getFullYear()} Ramlal Golchha Eye Hospital Foundation. All rights reserved.</p>



      </footer>



      )}



    </div>



  );



}

