/**
 * KakshaSahay - Generative Pedagogical Analogy Engine (Bhasha Setu)
 * Combines on-device quantized semantic synthesis with optional serverless edge LLMs.
 */
'use strict';

const GenerativeRAG = (() => {
  const dialectVillageArchetypes = {
    awadhi_bhojpuri: {
      name: 'अवधी / भोजपुरी (Eastern UP / Bihar)',
      nouns: ['बेर', 'पके आम', 'जामुन', 'हाट-बाज़ार', 'बैलगाड़ी का पहिया', 'अलाव', 'खुरपी', 'चकरघिन्नी', 'मचान', 'सीढ़ी', 'मिट्टी का चूल्हा', 'लोटा'],
      verbs: ['बंटवारा करना', 'हाट में खर्च होना', 'मचान से उतरना', 'पेड़ से टूटना', 'कीचड़ में फिसलना', 'धूप में सूखना']
    },
    bundeli: {
      name: 'बुंदेली / मालवी (Bundelkhand / MP)',
      nouns: ['ककड़ी', 'चबूतरा', 'खलियान', 'कुएं की घिरनी', 'मटके का पानी', 'सीढ़ी', 'सकोरी', 'पत्थर की गिट्टी'],
      verbs: ['घिरनी से खींचना', 'चबूतरे से नीचे आना', 'ककड़ी बांटना', 'धूप में भाप बनना']
    },
    chhattisgarhi: {
      name: 'छत्तीसगढ़ी / बघेली (Central India)',
      nouns: ['बोरे-बासी', 'धान की बाली', 'पचरी', 'खलिहान', 'महुआ', 'तेंदूपत्ता', 'बांस की टोकरी'],
      verbs: ['बाली से दाना अलग करना', 'पचरी पर पैर फिसलना', 'टोकरी में भरना', 'धूप में सुखाना']
    },
    maithili: {
      name: 'मैथिली / अंगिका (North Bihar / Mithila)',
      nouns: ['पोखरी (तालाब)', 'मखाना', 'जामुन का पेड़', 'पांत में भोजन', 'छठ का सूप', 'दौड़ा'],
      verbs: ['पोखरी में लहर उठना', 'पांत में बराबर परोसना', 'छत से उतरना', 'धूप में सुखाना']
    },
    urban_multilingual: {
      name: 'शहरी बहुभाषी (Urban Slum / Municipal Classroom)',
      nouns: ['10 रुपये का सिक्का', 'बिस्कुट का पैकेट', 'बस-मेट्रो की सीढ़ी', 'पानी का नल', 'टाइल्स पर फिसलन', 'पेंसिल-इरेज़र', 'ट्रैफिक सिग्नल'],
      verbs: ['दुकानदार को पैसे देना', 'सीढ़ी से नीचे आना', 'बिस्कुट बांटना', 'गीले फर्श पर फिसलना']
    }
  };

  const syllabusKnowledgeBank = {
    'घटाव': {
      topic: 'घटाव (Subtraction)',
      domain: 'गणित (Math)',
      standard: 'किसी संख्या में से दूसरी संख्या को घटाना अथवा कम करना।',
      ruralAnalogy: 'पेड़ से पके आम टूटना या साप्ताहिक हाट में पैसे खर्च होना।',
      ruralScript: 'अगर आपके पास 5 बेर हैं, और 2 बेर आपने छोटे भाई को दे दिए, तो आपकी हथेली में कितने बचे? इसे ही घटाव कहते हैं।',
      urbanAnalogy: 'जेब खर्च के 10 रुपयों में से 4 रुपये की पेंसिल खरीदना।',
      urbanScript: '10 रुपये में से 4 रुपये दुकानदार को दिए, कितने बचे? 6 बचे, यही घटाव है!',
      activity: 'स्लेट पर 10 कंकड़ रखें, 3 कंकड़ हटाकर बचे हुए गिनें।'
    },
    'अवरोही क्रम': {
      topic: 'अवरोही क्रम (Descending Order)',
      domain: 'गणित (Math)',
      standard: 'संख्याओं को बड़े से छोटे के घटते क्रम में व्यवस्थित करना।',
      ruralAnalogy: 'छत की सीढ़ी या खेत के मचान से नीचे उतरना।',
      ruralScript: 'जैसे हम 5वीं सीढ़ी से 4थी, फिर 3री और फिर ज़मीन पर आते हैं, वैसे ही बड़ी संख्या से छोटी संख्या की ओर आना अवरोही क्रम है।',
      urbanAnalogy: 'फ्लाईओवर या बहुमंजिला सीढ़ियों से नीचे उतरना।',
      urbanScript: 'जैसे तीसरी मंजिल से दूसरी, फिर पहली मंजिल पर आते हैं, वैसे ही 10 से 9, 8, 7 आना अवरोही क्रम है!',
      activity: 'बोर्ड पर सीढ़ी बनाकर 9, 7, 5, 2 को ऊपर से नीचे लिखवाएं।'
    },
    'भिन्न': {
      topic: 'भिन्न (Fractions / Equal Parts)',
      domain: 'गणित (Math)',
      standard: 'किसी संपूर्ण वस्तु को समान भागों में बांटकर उसके किसी भाग को दर्शाना।',
      ruralAnalogy: 'एक गोल रोटी या गुड़ के टुकड़े को दो भाई-बहनों में बराबर-बराबर बांटना।',
      ruralScript: 'जब हम एक गोल रोटी के दो बराबर टुकड़े करते हैं, तो हर टुकड़ा आधी रोटी (1/2) कहलाता है। यही भिन्न है!',
      urbanAnalogy: 'बिस्कुट के 4 बराबर टुकड़ों में से 1 टुकड़ा खाना (1/4)।',
      urbanScript: 'एक गोल बिस्कुट को 4 दोस्तों में बराबर बांटा, तो हर एक को एक-चौथाई (1/4) हिस्सा मिला।',
      activity: 'कागज़ की गोल रोटी बनाकर मोड़ें और 1/2 व 1/4 दिखाएं।'
    },
    'घर्षण': {
      topic: 'घर्षण (Friction)',
      domain: 'विज्ञान (Science)',
      standard: 'दो सतहों के बीच गति का विरोध करने वाला संपर्क बल।',
      ruralAnalogy: 'बरसात में कीचड़ में चप्पल फिसलना बनाम खुरदुरी पगडंडी पर संभलकर चलना।',
      ruralScript: 'कीचड़ में चप्पल क्यों फिसलती है? क्योंकि वहां रुकावट (घर्षण) कम है। खुरदुरी सड़क पर पैर टिकते हैं क्योंकि रुकावट ज़्यादा है।',
      urbanAnalogy: 'गीली टाइल पर फिसलना बनाम सड़क पर रबर के जूते की मजबूत पकड़।',
      urbanScript: 'टाइल पर पानी गिरा हो तो हम क्यों फिसलते हैं? क्योंकि रुकावट कम हो जाती है!',
      activity: 'चिकनी स्लेट और खुरदुरे फर्श पर कंकड़ लुढ़काकर दूरी नापें।'
    },
    'वाष्पीकरण': {
      topic: 'वाष्पीकरण (Evaporation)',
      domain: 'विज्ञान / EVS',
      standard: 'तापमान बढ़ने पर द्रव (पानी) का वाष्प या भाप में बदलकर हवा में उड़ जाना।',
      ruralAnalogy: 'धूप में आंगन में फैले गीले कुर्ते का सूखना या पोखरे का पानी धीरे-धीरे कम होना।',
      ruralScript: 'धूप में फैलाया हुआ गीला कुर्ता 2 घंटे में कैसे सूख जाता है? पानी सूरज की गर्मी से भाप बनकर आसमान में उड़ जाता है!',
      urbanAnalogy: 'कमरे में पोछा लगाने के बाद पंखे की हवा से फर्श का तुरंत सूख जाना।',
      urbanScript: 'फर्श पर लगा पानी 5 मिनट में कहाँ चला जाता है? पंखे की हवा और गर्मी से वह भाप बनकर हवा में मिल जाता है!',
      activity: 'स्लेट पर पानी की बूंद लगाएं और धूप में सूखते देखें।'
    },
    'प्रकाश संश्लेषण': {
      topic: 'प्रकाश संश्लेषण (Photosynthesis)',
      domain: 'विज्ञान / EVS',
      standard: 'हरे पौधे सूर्य के प्रकाश, पानी और कार्बन डाइऑक्साइड से अपना भोजन बनाते हैं।',
      ruralAnalogy: 'जैसे रसोई में मां चूल्हे की आग, पानी और आटे से रोटी पकाती है, वैसे पत्तियां पेड़ की रसोई हैं।',
      ruralScript: 'पेड़ की हरी पत्तियां रसोईघर हैं! सूरज की धूप उनकी आग है, और वे हवा-पानी से अपना मीठा भोजन तैयार करते हैं।',
      urbanAnalogy: 'सोलर कुकर में धूप की गर्मी से दाल-चावल पकना।',
      urbanScript: 'हरी पत्तियां सोलर पैनल की तरह धूप पकड़ती हैं और पेड़ के लिए शक्ति बनाती हैं।',
      activity: 'पौधे की पत्ती पर उंगली फेरकर हरा रंग और सूर्य की दिशा समझाएं।'
    },
    'संज्ञा': {
      topic: 'संज्ञा (Noun / Naming Words)',
      domain: 'भाषा (Language)',
      standard: 'किसी व्यक्ति, वस्तु, स्थान अथवा भाव के नाम को संज्ञा कहते हैं।',
      ruralAnalogy: 'गांव में जिस भी चीज़ को हम नाम से पुकारते हैं: गाय, नीम, लोटा, मेला, रमेश।',
      ruralScript: 'अपनी आंखें बंद करो! जो भी चीज़ तुम छू सकते हो या जिसका नाम पुकार सकते हो—जैसे लोटा, गाय, बस्ता—वह सब संज्ञा है!',
      urbanAnalogy: 'शहर में दिखने वाली हर नाम वाली चीज़: बस, मेट्रो, स्कूल, बोतल, पेंसिल।',
      urbanScript: 'कक्षा के अंदर देखो: ब्लैकबोर्ड, पंखा, रिया, बोतल—जिस भी चीज़ का नाम है, वह संज्ञा है!',
      activity: 'कक्षा के 5 बच्चों को बुलाकर उनके नाम और बस्ते की चीजें लिखवाएं।'
    },
    'सौरमंडल': {
      topic: 'सौरमंडल (Solar System)',
      domain: 'विज्ञान / EVS',
      standard: 'सूर्य और उसके चारों ओर परिक्रमा करने वाले खगोलीय पिंड व आठ ग्रह।',
      ruralAnalogy: 'सर्दियों में अलाव के चारों ओर गांव वालों का गोल घेरा बनाकर बैठना।',
      ruralScript: 'सूरज हमारे परिवार का मुखिया है, और पृथ्वी व बाक़ी ग्रह उसके चारों ओर चक्कर लगाते हुए रोशनी पाते हैं।',
      urbanAnalogy: 'गोल ट्रैफिक सर्कल के चारों तरफ लेन में घूमती गाड़ियां।',
      urbanScript: 'सूरज चौराहे का केंद्र है और आठों ग्रह अपनी-अपनी पक्की लेन में उसके इर्द-गिर्द घूम रहे हैं।',
      activity: 'कक्षा में 1 बच्चे को सूरज बनाकर बाक़ी 8 को चारों तरफ घुमाएं।'
    },
    'गुरुत्वाकर्षण': {
      topic: 'गुरुत्वाकर्षण (Gravity)',
      domain: 'विज्ञान (Science)',
      standard: 'पृथ्वी का वह खिंचाव बल जो सभी वस्तुओं को अपनी केंद्र की ओर खींचता है।',
      ruralAnalogy: 'पेड़ से पके बेर का नीचे ज़मीन पर ही गिरना, आसमान में न उड़ना।',
      ruralScript: 'अगर हम कंकड़ ऊपर फेंकें तो वह नीचे क्यों लौट आता है? क्योंकि हमारी धरती मां में एक जादुई खिंचाव है जिसे गुरुत्वाकर्षण कहते हैं!',
      urbanAnalogy: 'हाथ से छूटा हुआ मोबाइल या गेंद सीधे फर्श पर गिरना।',
      urbanScript: 'गेंद को चाहे जितनी ज़ोर से ऊपर उछालो, धरती उसे चुंबक की तरह वापस नीचे खींच लेती है!',
      activity: 'चौक का टुकड़ा हवा में उछालें और बच्चों से पूछें कि यह नीचे क्यों गिरा।'
    }
  };

  // Educational Safety Boundaries (Phase 11): Refuse clinical/medical diagnosis or unsafe prompts
  const UNSAFE_PATTERNS = [
    /adhd|autism|dyslexia|disorder|iq\b|mental\b|depression|therapy|medication|psycholog/i,
    /weapon|violence|knife|gun|poison|fire|kill|cut/i,
    /medical|prescription|disease|diagnosis|syndrome/i
  ];

  async function generateAnalogy(conceptText, dialectKey, schoolMode) {
    const rawConcept = (conceptText || 'घटाव').trim();

    // Check Educational Safety Boundary
    if (UNSAFE_PATTERNS.some(p => p.test(rawConcept))) {
      return {
        topic: rawConcept,
        domain: 'सुरक्षित शैक्षणिक सीमा (Educational Safety Boundary)',
        standard: 'प्राथमिक शिक्षण के दायरे से बाहर (Out of Primary Pedagogical Scope)',
        analogy: 'कक्षासहाय केवल बुनियादी साक्षरता और संख्यात्मक शिक्षण (FLN) के लिए है। यह किसी भी चिकित्सीय या मनोवैज्ञानिक मूल्यांकन की सिफारिश नहीं करता।',
        script: 'कक्षासहाय बाल-मनोवैज्ञानिक या चिकित्सीय परामर्श का विकल्प नहीं है। आवश्यक होने पर विशेषज्ञ या बाल-स्वास्थ्य अधिकारी से परामर्श लें।',
        activity: 'सामान्य कक्षा शिक्षण व बुनियादी पठन-पाठन जारी रखें।',
        dialectName: 'सुरक्षित शिक्षण नीति (Safe Pedagogy Policy)',
        isCloudEdge: false,
        isSafeRefusal: true
      };
    }

    const cleanConcept = rawConcept;
    const arch = dialectVillageArchetypes[dialectKey] || dialectVillageArchetypes.awadhi_bhojpuri;
    const edgeApiKey = StateStore.getState().edgeApiKey;

    // 1. Try Serverless Edge LLM API if key is provided and online
    if (edgeApiKey && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const prompt = `You are KakshaSahay generative engine for Indian primary teachers (NIPUN Bharat).
Generate a localized primary school pedagogy card for syllabus concept: "${cleanConcept}" in dialect context: "${arch.name}".
Return ONLY a valid JSON object:
{
  "topic": "${cleanConcept}",
  "domain": "प्राथमिक पाठ्यक्रम",
  "standard": "किताबी परिभाषा",
  "analogy": "स्थानीय घरेलू रूपक",
  "script": "कक्षा शिक्षक का मौखिक संवाद",
  "activity": "श्यामपट्ट व कंकड़ गतिविधि"
}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${edgeApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          const textOutput = resJson.candidates[0].content.parts[0].text;
          const parsed = JSON.parse(textOutput);
          return {
            ...parsed,
            dialectName: arch.name,
            isCloudEdge: true
          };
        }
      } catch (err) {
        console.warn('[GenerativeRAG] Edge LLM fallback to on-device engine:', err);
      }
    }

    // 2. On-Device Quantized Knowledge Bank Hit
    for (const [key, data] of Object.entries(syllabusKnowledgeBank)) {
      if (cleanConcept.toLowerCase().includes(key) || key.includes(cleanConcept.toLowerCase())) {
        return {
          topic: data.topic,
          domain: data.domain,
          standard: data.standard,
          analogy: schoolMode === 'rural' ? data.ruralAnalogy : data.urbanAnalogy,
          script: schoolMode === 'rural' ? data.ruralScript : data.urbanScript,
          activity: data.activity,
          dialectName: arch.name,
          isCloudEdge: false
        };
      }
    }

    // 3. Dynamic On-Device Semantic Grammar Generator
    const sampleNoun = arch.nouns[Math.floor(Math.random() * arch.nouns.length)];
    const sampleVerb = arch.verbs[Math.floor(Math.random() * arch.verbs.length)];

    return {
      topic: cleanConcept,
      domain: 'पाठ्यपुस्तक मूलभूत संकल्पना (General Syllabus)',
      standard: `${cleanConcept} - प्राथमिक स्तर की पाठ्यपुस्तक संकल्पना।`,
      analogy: `${arch.name} परिवेश में जैसे ${sampleNoun} के साथ ${sampleVerb} होता है, ठीक उसी प्रकार इस संकल्पना को बच्चे सरलता से सीख सकते हैं।`,
      script: `बच्चों, अपने दैनिक जीवन में देखो! जैसे हम ${sampleNoun} को रोजमर्रा के काम में देखते हैं, वैसे ही ${cleanConcept} को हम सीधे समझ सकते हैं।`,
      activity: `श्यामपट्ट पर ${sampleNoun} का चित्र बनाकर 2-2 बच्चों के समूह में इस पर चर्चा कराएं।`,
      dialectName: arch.name,
      isCloudEdge: false
    };
  }

  function getKnowledgeBankSize() {
    return Object.keys(syllabusKnowledgeBank).length;
  }

  return {
    generateAnalogy,
    getKnowledgeBankSize,
    DialectAnalogyTable: syllabusKnowledgeBank,
    DialectVillageArchetypes: dialectVillageArchetypes
  };
})();

if (typeof window !== 'undefined') {
  window.GenerativeRAG = GenerativeRAG;
}
if (typeof globalThis !== 'undefined') {
  globalThis.GenerativeRAG = GenerativeRAG;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GenerativeRAG };
}
