import { useTranslation } from 'react-i18next';

// Dictionary mapping English location names to their Telugu and Hindi equivalents
export const locationTranslations = {
    // States
    "Andhra Pradesh": {
        te: "ఆంధ్రప్రదేశ్",
        hi: "आंध्र प्रदेश"
    },
    // Districts (Top examples)
    "Alluri Sitharama Raju": { te: "అల్లూరి సీతారామ రాజు", hi: "अल्लूरी सीताराम राजू" },
    "Anakapalli": { te: "అనకాపల్లి", hi: "अनकापल्ली" },
    "Ananthapuramu": { te: "అనంతపురం", hi: "अनंतपुर" },
    "Annamayya": { te: "అన్నమయ్య", hi: "अन्नमय्या" },
    "Bapatla": { te: "బాపట్ల", hi: "बापटला" },
    "Chittoor": { te: "చిత్తూరు", hi: "चित्तूर" },
    "Dr. B.R. Ambedkar Konaseema": { te: "డాక్టర్ బి.ఆర్. అంబేద్కర్ కోనసీమ", hi: "डॉ. बी.आर. अंबेडकर कोनासीमा" },
    "East Godavari": { te: "తూర్పు గోదావరి", hi: "पूर्वी गोदावरी" },
    "Eluru": { te: "ఏలూరు", hi: "एलुरु" },
    "Guntur": { te: "గుంటూరు", hi: "गुंटूर" },
    "Kakinada": { te: "కాకినాడ", hi: "काकीनाडा" },
    "Krishna": { te: "కృష్ణా", hi: "कृष्णा" },
    "Kurnool": { te: "కర్నూలు", hi: "कुरनूल" },
    "Nandyal": { te: "నంద్యాల", hi: "नंद्याल" },
    "Ntr": { te: "ఎన్టీఆర్", hi: "एनटीआर" },
    "Palnadu": { te: "పల్నాడు", hi: "पल्नडु" },
    "Parvathipuram Manyam": { te: "పార్వతీపురం మన్యం", hi: "पार्वतीपुरम मान्यम" },
    "Prakasam": { te: "ప్రకాశం", hi: "प्रकाशम" },
    "Srikakulam": { te: "శ్రీకాకుళం", hi: "श्रीकाकुलम" },
    "Sri Potti Sriramulu Nellore": { te: "శ్రీ పొట్టి శ్రీరాములు నెల్లూరు", hi: "श्री पोट्टी श्रीरामुलु नेल्लोर" },
    "Sri Sathya Sai": { te: "శ్రీ సత్య సాయి", hi: "श्री सत्य साईं" },
    "Tirupati": { te: "తిరుపతి", hi: "तिरुपति" },
    "Visakhapatnam": { te: "విశాఖపట్నం", hi: "विशाखापत्तनम" },
    "Vizianagaram": { te: "విజయనగరం", hi: "विजयनगरम" },
    "West Godavari": { te: "పశ్చిమ గోదావరి", hi: "पश्चिम गोदावरी" },
    "Y.S.R. Kadapa": { te: "వై.యస్.ఆర్. కడప", hi: "वाई.एस.आर. कडप्पा" },

    // Departments
    "Police Department": { te: "పోలీస్ శాఖ", hi: "पुलिस विभाग" },
    "Municipality / Panchayat": { te: "మున్సిపాలిటీ / పంచాయతీ", hi: "नगर पालिका / पंचायत" },
    "Revenue Department": { te: "రెవెన్యూ శాఖ", hi: "राजस्व विभाग" },
    "Judicial / Legal": { te: "న్యాయ శాఖ", hi: "न्यायिक / कानूनी" },
    "Health & Medical": { te: "ఆరోగ్య & వైద్య శాఖ", hi: "स्वास्थ्य और चिकित्सा" },
    "Education Department": { te: "విద్యా శాఖ", hi: "शिक्षा विभाग" },
    "Electricity Board": { te: "విద్యుత్ శాఖ", hi: "विद्युत बोर्ड" },
    "Water Supply & Sanitation": { te: "నీటి సరఫరా శాఖ", hi: "जल आपूर्ति विभाग" },
    "Transport Department": { te: "రవాణా శాఖ", hi: "परिवहन विभाग" },
    "Civil Supplies (Ration)": { te: "పౌర సరఫరాల శాఖ", hi: "नागरिक आपूर्ति (राशन)" },
    "Women & Child Welfare": { te: "మహిళా & శిశు సంక్షేమ శాఖ", hi: "महिला एवं बाल कल्याण" },
    "Agriculture Department": { te: "వ్యవసాయ శాఖ", hi: "कृषि विभाग" },
    "Political / Elected Representatives": { te: "రాజకీయ / ప్రజాప్రతినిధులు", hi: "राजनीतिक / जन प्रतिनिधि" },
    "Other": { te: "ఇతర", hi: "अन्य" }
};

export function useLocationTranslation() {
    const { i18n } = useTranslation();
    const lang = i18n.language; // 'en', 'te', 'hi'

    // Translate a location name if it exists in the dictionary, otherwise return the original English name
    const tLoc = (englishName) => {
        if (!englishName) return '';
        if (lang === 'en') return englishName; // Always return exact DB string for English

        const translation = locationTranslations[englishName]?.[lang];
        return translation || englishName; // Fallback to English if translation doesn't exist
    };

    return { tLoc, lang };
}
