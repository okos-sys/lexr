import { useState, useRef, useCallback, useEffect } from "react";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}
async function ensureLibs() {
  await Promise.all([
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"),
    loadScript("https://unpkg.com/docx@8.5.0/build/index.js"),
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"),
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"),
  ]);
  if (window.pdfjsLib) window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

const T = {
  en: {
    appSub: "Legal Document Analysis", tabContract: "Contract Review", tabQA: "Legal Q&A",
    uploadTitle: "Drop contract here or click to upload", uploadSub: "DOCX · PDF · TXT · MD",
    orPaste: "— or paste below —", pastePlaceholder: "Paste contract text here…",
    parsingDoc: "Parsing document…", detectingParties: "Detecting parties…",
    reviewingParty: "Reviewing Party", customParty: "Or type a custom party name:",
    customPlaceholder: "Custom party name…", noPartyDetected: "No parties detected — enter manually",
    uploadFirst: "Upload a document first", partyHint: "LEXR will flag all clauses unfavourable to the selected party.",
    jurisdiction: "Jurisdiction", jurisdictionHint: "Set via header dropdown",
    analyseBtn: "Analyse Contract", newAnalysis: "← New Analysis",
    downloadDocx: "↓ Download DOCX", downloadPdf: "↓ Export PDF", emailReport: "✉ Email Report",
    execSummary: "Executive Summary", overallRisk: "Overall Risk", issuesFound: "Issues Found",
    flaggedClauses: "Flagged Clauses", clauseDetail: "Clause Detail",
    whyUnfavourable: "Why It's Unfavourable", originalText: "Original Text", suggestedReform: "Suggested Reformulation",
    analysisError: "Analysis failed. Please try again.", noDocError: "Please provide both the document text and the reviewing party.",
    sessionHistory: "Session History", noHistory: "No previous analyses this session.",
    qaPlaceholder: "Describe your legal question or situation…", qaEmptyTitle: "Ask a Legal Question",
    qaEmptyBody: "Describe your situation or upload a document. I'll provide strategy, steps, and legislation references.",
    activeJurisdiction: "Active Jurisdiction", jurisdictionNote: "Legislation links will reference",
    suggestedQ: "Suggested Questions", negotiateTab: "Negotiate Clause",
    negotiatePlaceholder: "Paste the specific clause you want to negotiate…", negotiateBtn: "Get Negotiation Positions",
    negotiateHint: "Get 3 negotiation positions for any clause: Aggressive, Balanced, and Conciliatory.",
    aggressive: "Aggressive", balanced: "Balanced", conciliatory: "Conciliatory",
    tip: "Tip: Upload a document alongside your question for context-aware analysis.",
    charExtracted: "characters extracted", high: "high", medium: "medium", low: "low",
  },
  de: {
    appSub: "Juristische Dokumentenanalyse", tabContract: "Vertragsanalyse", tabQA: "Rechtsfragen",
    uploadTitle: "Vertrag hier ablegen oder hochladen", uploadSub: "DOCX · PDF · TXT · MD",
    orPaste: "— oder Text einfügen —", pastePlaceholder: "Vertragstext hier einfügen…",
    parsingDoc: "Dokument wird verarbeitet…", detectingParties: "Parteien werden erkannt…",
    reviewingParty: "Geprüfte Partei", customParty: "Oder Namen manuell eingeben:",
    customPlaceholder: "Parteiname…", noPartyDetected: "Keine Parteien erkannt — manuell eingeben",
    uploadFirst: "Zuerst Dokument hochladen", partyHint: "LEXR markiert alle für die gewählte Partei nachteiligen Klauseln.",
    jurisdiction: "Rechtsordnung", jurisdictionHint: "Im Header-Dropdown festlegen",
    analyseBtn: "Vertrag analysieren", newAnalysis: "← Neue Analyse",
    downloadDocx: "↓ DOCX herunterladen", downloadPdf: "↓ PDF exportieren", emailReport: "✉ Bericht senden",
    execSummary: "Zusammenfassung", overallRisk: "Gesamtrisiko", issuesFound: "Probleme gefunden",
    flaggedClauses: "Problematische Klauseln", clauseDetail: "Klauseldetails",
    whyUnfavourable: "Warum nachteilig", originalText: "Originaltext", suggestedReform: "Vorgeschlagene Formulierung",
    analysisError: "Analyse fehlgeschlagen. Bitte erneut versuchen.", noDocError: "Bitte Vertragstext und Partei angeben.",
    sessionHistory: "Sitzungsverlauf", noHistory: "Keine früheren Analysen in dieser Sitzung.",
    qaPlaceholder: "Rechtliche Frage oder Situation beschreiben…", qaEmptyTitle: "Rechtsfrage stellen",
    qaEmptyBody: "Beschreiben Sie Ihre Situation oder laden Sie ein Dokument hoch. Ich liefere Strategie, Schritte und Gesetzesverweise.",
    activeJurisdiction: "Aktive Rechtsordnung", jurisdictionNote: "Gesetzesverweise aus",
    suggestedQ: "Vorgeschlagene Fragen", negotiateTab: "Klausel verhandeln",
    negotiatePlaceholder: "Konkrete Klausel zum Verhandeln einfügen…", negotiateBtn: "Verhandlungspositionen abrufen",
    negotiateHint: "3 Verhandlungspositionen für jede Klausel: Aggressiv, Ausgewogen, Konziliant.",
    aggressive: "Aggressiv", balanced: "Ausgewogen", conciliatory: "Konziliant",
    tip: "Tipp: Laden Sie ein Dokument mit Ihrer Frage hoch für kontextbewusste Analyse.",
    charExtracted: "Zeichen extrahiert", high: "hoch", medium: "mittel", low: "niedrig",
  },
  fr: {
    appSub: "Analyse de Documents Juridiques", tabContract: "Analyse de Contrat", tabQA: "Questions Juridiques",
    uploadTitle: "Déposez le contrat ici ou cliquez pour télécharger", uploadSub: "DOCX · PDF · TXT · MD",
    orPaste: "— ou collez le texte ci-dessous —", pastePlaceholder: "Collez le texte du contrat ici…",
    parsingDoc: "Traitement du document…", detectingParties: "Détection des parties…",
    reviewingParty: "Partie analysée", customParty: "Ou saisissez un nom de partie:",
    customPlaceholder: "Nom de la partie…", noPartyDetected: "Aucune partie détectée — saisir manuellement",
    uploadFirst: "Téléchargez d'abord un document", partyHint: "LEXR signalera toutes les clauses défavorables à la partie sélectionnée.",
    jurisdiction: "Juridiction", jurisdictionHint: "Défini via le menu déroulant",
    analyseBtn: "Analyser le contrat", newAnalysis: "← Nouvelle analyse",
    downloadDocx: "↓ Télécharger DOCX", downloadPdf: "↓ Exporter PDF", emailReport: "✉ Envoyer le rapport",
    execSummary: "Résumé exécutif", overallRisk: "Risque global", issuesFound: "Problèmes trouvés",
    flaggedClauses: "Clauses problématiques", clauseDetail: "Détail de la clause",
    whyUnfavourable: "Pourquoi défavorable", originalText: "Texte original", suggestedReform: "Reformulation proposée",
    analysisError: "Analyse échouée. Veuillez réessayer.", noDocError: "Veuillez fournir le texte et la partie.",
    sessionHistory: "Historique de session", noHistory: "Aucune analyse précédente dans cette session.",
    qaPlaceholder: "Décrivez votre question ou situation juridique…", qaEmptyTitle: "Posez une question juridique",
    qaEmptyBody: "Décrivez votre situation ou téléchargez un document. Je fournirai une stratégie, des étapes et des références législatives.",
    activeJurisdiction: "Juridiction active", jurisdictionNote: "Les références législatives seront de",
    suggestedQ: "Questions suggérées", negotiateTab: "Négocier une clause",
    negotiatePlaceholder: "Collez la clause spécifique à négocier…", negotiateBtn: "Obtenir des positions",
    negotiateHint: "3 positions de négociation pour toute clause : Agressive, Équilibrée, Conciliante.",
    aggressive: "Agressive", balanced: "Équilibrée", conciliatory: "Conciliante",
    tip: "Conseil : téléchargez un document avec votre question pour une analyse contextuelle.",
    charExtracted: "caractères extraits", high: "élevé", medium: "moyen", low: "faible",
  },
  pl: {
    appSub: "Analiza Dokumentów Prawnych", tabContract: "Przegląd Umowy", tabQA: "Pytania Prawne",
    uploadTitle: "Upuść umowę tutaj lub kliknij, aby przesłać", uploadSub: "DOCX · PDF · TXT · MD",
    orPaste: "— lub wklej tekst poniżej —", pastePlaceholder: "Wklej tekst umowy tutaj…",
    parsingDoc: "Przetwarzanie dokumentu…", detectingParties: "Wykrywanie stron…",
    reviewingParty: "Analizowana strona", customParty: "Lub wpisz nazwę strony ręcznie:",
    customPlaceholder: "Nazwa strony…", noPartyDetected: "Nie wykryto stron — wpisz ręcznie",
    uploadFirst: "Najpierw prześlij dokument", partyHint: "LEXR oznaczy wszystkie klauzule niekorzystne dla wybranej strony.",
    jurisdiction: "Jurysdykcja", jurisdictionHint: "Ustaw w menu nagłówka",
    analyseBtn: "Analizuj umowę", newAnalysis: "← Nowa analiza",
    downloadDocx: "↓ Pobierz DOCX", downloadPdf: "↓ Eksportuj PDF", emailReport: "✉ Wyślij raport",
    execSummary: "Streszczenie", overallRisk: "Ogólne ryzyko", issuesFound: "Znalezione problemy",
    flaggedClauses: "Problematyczne klauzule", clauseDetail: "Szczegóły klauzuli",
    whyUnfavourable: "Dlaczego niekorzystne", originalText: "Oryginalny tekst", suggestedReform: "Proponowane sformułowanie",
    analysisError: "Analiza nie powiodła się. Spróbuj ponownie.", noDocError: "Podaj tekst umowy i stronę.",
    sessionHistory: "Historia sesji", noHistory: "Brak poprzednich analiz w tej sesji.",
    qaPlaceholder: "Opisz swoje pytanie lub sytuację prawną…", qaEmptyTitle: "Zadaj pytanie prawne",
    qaEmptyBody: "Opisz swoją sytuację lub prześlij dokument. Zapewnię strategię, kroki i odniesienia do przepisów.",
    activeJurisdiction: "Aktywna jurysdykcja", jurisdictionNote: "Odniesienia do przepisów z",
    suggestedQ: "Sugerowane pytania", negotiateTab: "Negocjuj klauzulę",
    negotiatePlaceholder: "Wklej konkretną klauzulę do negocjacji…", negotiateBtn: "Uzyskaj pozycje negocjacyjne",
    negotiateHint: "3 pozycje negocjacyjne dla każdej klauzuli: Agresywna, Zbalansowana, Pojednawcza.",
    aggressive: "Agresywna", balanced: "Zbalansowana", conciliatory: "Pojednawcza",
    tip: "Wskazówka: prześlij dokument wraz z pytaniem dla analizy kontekstowej.",
    charExtracted: "wyodrębnionych znaków", high: "wysoki", medium: "średni", low: "niski",
  },
  ua: {
    appSub: "Аналіз Юридичних Документів", tabContract: "Огляд Договору", tabQA: "Юридичний Чат",
    uploadTitle: "Перетягніть договір або натисніть для завантаження", uploadSub: "DOCX · PDF · TXT · MD",
    orPaste: "— або вставте текст нижче —", pastePlaceholder: "Вставте текст договору тут…",
    parsingDoc: "Обробка документу…", detectingParties: "Визначення сторін…",
    reviewingParty: "Сторона для аналізу", customParty: "Або введіть назву вручну:",
    customPlaceholder: "Назва сторони…", noPartyDetected: "Сторін не знайдено — введіть вручну",
    uploadFirst: "Спочатку завантажте документ", partyHint: "LEXR позначить умови, що невигідні для обраної сторони.",
    jurisdiction: "Юрисдикція", jurisdictionHint: "Встановлюється у заголовку",
    analyseBtn: "Аналізувати Договір", newAnalysis: "← Новий Аналіз",
    downloadDocx: "↓ Завантажити DOCX", downloadPdf: "↓ Експорт PDF", emailReport: "✉ Надіслати Звіт",
    execSummary: "Резюме", overallRisk: "Загальний Ризик", issuesFound: "Знайдено Проблем",
    flaggedClauses: "Проблемні Пункти", clauseDetail: "Деталі Пункту",
    whyUnfavourable: "Чому невигідно", originalText: "Оригінальний текст", suggestedReform: "Запропонована редакція",
    analysisError: "Аналіз не вдався. Спробуйте ще раз.", noDocError: "Будь ласка, вкажіть текст договору та сторону.",
    sessionHistory: "Історія Сесії", noHistory: "Немає попередніх аналізів у цій сесії.",
    qaPlaceholder: "Опишіть ваше юридичне питання або ситуацію…", qaEmptyTitle: "Поставте Юридичне Питання",
    qaEmptyBody: "Опишіть ситуацію або завантажте документ. Я надам стратегію, кроки та посилання на законодавство.",
    activeJurisdiction: "Активна Юрисдикція", jurisdictionNote: "Посилання на законодавство з",
    suggestedQ: "Типові Питання", negotiateTab: "Переговорні Позиції",
    negotiatePlaceholder: "Вставте конкретний пункт договору для переговорів…", negotiateBtn: "Отримати Позиції",
    negotiateHint: "Отримайте 3 переговорні позиції для будь-якого пункту: Агресивна, Збалансована, Поступлива.",
    aggressive: "Агресивна", balanced: "Збалансована", conciliatory: "Поступлива",
    tip: "Порада: завантажте документ разом із питанням для контекстного аналізу.",
    charExtracted: "символів витягнуто", high: "високий", medium: "середній", low: "низький",
  },
};

const JURISDICTIONS = [
  { value: "at", label: "Austria",          langs: ["de", "en"] },
  { value: "de", label: "Germany",          langs: ["de", "en"] },
  { value: "eu", label: "European Union",   langs: ["en", "de", "fr", "pl"] },
  { value: "fr", label: "France",           langs: ["fr", "en"] },
  { value: "pl", label: "Poland",           langs: ["pl", "en"] },
  { value: "ch", label: "Switzerland",      langs: ["de", "fr", "en"] },
  { value: "ua", label: "Ukraine",          langs: ["ua", "en"] },
  { value: "uk", label: "United Kingdom",   langs: ["en"] },
  { value: "us", label: "United States",    langs: ["en"] },
];

const LANG_LABELS = { en: "EN", ua: "UA", de: "DE", fr: "FR", pl: "PL" };

const RISK_COLORS = {
  high:   { bg: "#3d1a1a", border: "#c0392b", text: "#f5a89a", badge: "#c0392b", badgeText: "#fff" },
  medium: { bg: "#3d2e0a", border: "#d68910", text: "#f8c471", badge: "#d68910", badgeText: "#fff" },
  low:    { bg: "#0d2a1e", border: "#1e8449", text: "#82e0aa", badge: "#1e8449", badgeText: "#fff" },
};

const S = {
  app: { minHeight: "100vh", background: "linear-gradient(160deg, #0d1117 0%, #131c2e 50%, #0d1117 100%)", fontFamily: "'Crimson Pro', 'Georgia', serif", color: "#e8e0d0" },
  header: { borderBottom: "1px solid #1e2d44", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, background: "rgba(13,17,23,0.92)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoMark: { width: 32, height: 32, background: "linear-gradient(135deg, #2e5f9e, #1a3a6b)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #2e5f9e" },
  logoText: { fontSize: 17, fontWeight: 500, color: "#c8d8e8", letterSpacing: "0.18em", fontFamily: "'DM Mono', monospace" },
  logoSub: { fontSize: 10, color: "#c8d8e8", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginTop: 1, opacity: 0.45 },
  tabBar: { display: "flex", gap: 3, background: "#161d2b", borderRadius: 8, padding: 3 },
  tab: (active) => ({ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "'DM Mono', monospace", letterSpacing: "0.03em", transition: "all 0.15s", background: active ? "#1e3a5f" : "transparent", color: active ? "#7eb8f7" : "#6b8aad", outline: "none", whiteSpace: "nowrap" }),
  main: { maxWidth: 1320, margin: "0 auto", padding: "1.5rem 2rem" },
  card: { background: "rgba(19,28,46,0.8)", border: "1px solid #1e2d44", borderRadius: 12, padding: "1.25rem", backdropFilter: "blur(8px)" },
  label: { fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a6a8a", marginBottom: 8, display: "block" },
  select: { background: "#0d1117", border: "1px solid #1e2d44", borderRadius: 6, color: "#c8d8e8", padding: "7px 10px", fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none", cursor: "pointer", width: "100%" },
  input: { background: "#0d1117", border: "1px solid #1e2d44", borderRadius: 6, color: "#c8d8e8", padding: "8px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" },
  textarea: { background: "#0d1117", border: "1px solid #1e2d44", borderRadius: 6, color: "#c8d8e8", padding: "10px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", width: "100%", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 },
  btn: { background: "linear-gradient(135deg, #1e3a5f, #2e5f9e)", border: "1px solid #2e5f9e", borderRadius: 8, color: "#c8deff", padding: "9px 18px", fontSize: 12, fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 7 },
  btnGhost: { background: "transparent", border: "1px solid #1e2d44", borderRadius: 8, color: "#6b8aad", padding: "9px 14px", fontSize: 12, fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 7 },
  uploadZone: (drag) => ({ border: `2px dashed ${drag ? "#2e5f9e" : "#1e2d44"}`, borderRadius: 10, padding: "1.1rem", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: drag ? "rgba(46,95,158,0.08)" : "transparent" }),
  badge: (risk) => ({ display: "inline-block", padding: "2px 9px", borderRadius: 20, fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", textTransform: "uppercase", background: RISK_COLORS[risk]?.badge || "#555", color: RISK_COLORS[risk]?.badgeText || "#fff", fontWeight: 600 }),
  issueCard: (risk) => ({ background: RISK_COLORS[risk].bg, border: `1px solid ${RISK_COLORS[risk].border}`, borderRadius: 8, padding: "0.9rem 1.1rem", marginBottom: 9 }),
  spinner: { width: 18, height: 18, border: "2px solid #1e2d44", borderTop: "2px solid #2e5f9e", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 },
};

function Spinner({ label }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6b8aad", fontSize: 13 }}><div style={S.spinner} />{label}</div>;
}

async function readFileText(file) {
  await ensureLibs();
  const ext = file.name.split(".").pop().toLowerCase();
  if (ext === "txt" || ext === "md") {
    return new Promise((res, rej) => { const r = new FileReader(); r.onload = e => res(e.target.result); r.onerror = rej; r.readAsText(file, "UTF-8"); });
  }
  if (ext === "docx") {
    return new Promise((res, rej) => {
      const r = new FileReader(); r.onerror = rej;
      r.onload = async (e) => {
        try {
          const result = await window.mammoth.extractRawText({ arrayBuffer: e.target.result });
          const text = result?.value?.trim();
          if (!text || text.length < 20) throw new Error("Document appears empty or unreadable");
          res(text);
        } catch (err) { rej(err); }
      };
      r.readAsArrayBuffer(file);
    });
  }
  if (ext === "pdf") {
    return new Promise((res, rej) => {
      const r = new FileReader(); r.onerror = rej;
      r.onload = async (e) => {
        try {
          const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(e.target.result) }).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            fullText += content.items.map(it => it.str).join(" ") + "\n";
          }
          const text = fullText.trim();
          if (!text || text.length < 20) throw new Error("PDF has no text layer (may be scanned)");
          res(text);
        } catch (err) { rej(err); }
      };
      r.readAsArrayBuffer(file);
    });
  }
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = e => res(e.target.result); r.onerror = rej; r.readAsText(file, "UTF-8"); });
}

function callClaude(messages, systemPrompt) {
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 8000, system: systemPrompt, messages }),
  }).then(r => r.json());
}

async function generateDocx(issues, party, docTitle, jurisdiction, lang) {
  await ensureLibs();
  if (!window.docx) { alert("docx.js not loaded."); return; }
  const { Document, Paragraph, TextRun, HeadingLevel, Packer } = window.docx;
  const jLabel = JURISDICTIONS.find(j => j.value === jurisdiction)?.label || jurisdiction;
  const children = [
    new Paragraph({ text: "LEXR — Contract Review Report", heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: "Document: ", bold: true }), new TextRun(docTitle || "Contract")] }),
    new Paragraph({ children: [new TextRun({ text: "Party reviewed: ", bold: true }), new TextRun(party)] }),
    new Paragraph({ children: [new TextRun({ text: "Jurisdiction: ", bold: true }), new TextRun(jLabel)] }),
    new Paragraph({ children: [new TextRun({ text: "Generated: ", bold: true }), new TextRun(new Date().toLocaleDateString())] }),
    new Paragraph({ text: "" }),
    new Paragraph({ text: "Flagged Issues", heading: HeadingLevel.HEADING_2, spacing: { after: 100, before: 200 } }),
  ];
  issues.forEach((issue, i) => {
    children.push(
      new Paragraph({ text: `${i + 1}. ${issue.clause}`, heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }),
      new Paragraph({ children: [new TextRun({ text: "Risk: ", bold: true }), new TextRun({ text: issue.risk.toUpperCase(), color: issue.risk === "high" ? "C0392B" : issue.risk === "medium" ? "D68910" : "1E8449" })] }),
      new Paragraph({ children: [new TextRun({ text: "Why unfavourable: ", bold: true }), new TextRun(issue.reason)] }),
      new Paragraph({ children: [new TextRun({ text: "Original text: ", bold: true }), new TextRun({ text: issue.original, color: "C0392B", italics: true })] }),
      new Paragraph({ children: [new TextRun({ text: "Suggested: ", bold: true }), new TextRun({ text: issue.suggested, color: "1E8449" })] }),
      new Paragraph({ text: "" }),
    );
  });
  const blob = await Packer.toBlob(new Document({ sections: [{ children }] }));
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "lexr-review.docx"; a.click();
  URL.revokeObjectURL(url);
}

async function generatePDF(result, party, docTitle, jurisdiction) {
  await ensureLibs();
  if (!window.jspdf) { alert("jsPDF not loaded."); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const jLabel = JURISDICTIONS.find(j => j.value === jurisdiction)?.label || jurisdiction;
  const M = 20; const TW = 170;
  let y = 20;
  const nl = (size, bold) => size * (bold ? 0.5 : 0.45);
  const addLine = (text, size, bold, rgb) => {
    doc.setFontSize(size); doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...(rgb || [200, 216, 232]));
    const lines = doc.splitTextToSize(String(text || ""), TW);
    if (y + lines.length * nl(size, bold) > 275) { doc.addPage(); y = 20; }
    doc.text(lines, M, y); y += lines.length * nl(size, bold) + 2;
  };
  const rule = () => { doc.setDrawColor(30, 45, 68); doc.line(M, y, 190, y); y += 6; };

  doc.setFillColor(13, 17, 23); doc.rect(0, 0, 210, 28, "F");
  doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.setTextColor(200, 216, 232); doc.text("LEXR", M, 17);
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 140, 180); doc.text("Legal Document Analysis Report", M + 20, 17);
  y = 36;

  addLine(`Document: ${docTitle || "Contract"}`, 9, false, [80, 110, 140]);
  addLine(`Party reviewed: ${party}`, 9, false, [80, 110, 140]);
  addLine(`Jurisdiction: ${jLabel}`, 9, false, [80, 110, 140]);
  addLine(`Date: ${new Date().toLocaleDateString()}`, 9, false, [80, 110, 140]);
  y += 3; rule();
  addLine("Executive Summary", 13, true);
  addLine(result.summary, 10, false, [180, 200, 220]);
  y += 2;
  const rc = result.overallRisk === "high" ? [192, 57, 43] : result.overallRisk === "medium" ? [214, 137, 16] : [30, 132, 73];
  addLine(`Overall Risk: ${result.overallRisk.toUpperCase()}   ·   Issues Found: ${result.issues.length}`, 11, true, rc);
  y += 2; rule();
  addLine("Flagged Issues", 13, true);
  result.issues.forEach((issue, i) => {
    const c = issue.risk === "high" ? [192, 57, 43] : issue.risk === "medium" ? [214, 137, 16] : [30, 132, 73];
    addLine(`${i + 1}. ${issue.clause}   [${issue.risk.toUpperCase()}]`, 11, true, c);
    addLine(issue.reason, 9, false, [160, 180, 200]);
    addLine(`Suggested: ${issue.suggested}`, 9, false, [100, 190, 140]);
    y += 2;
  });
  doc.save("lexr-report.pdf");
}

// ─── Contract Review ──────────────────────────────────────────────────────────
function ContractTab({ jurisdiction, lang, history, addHistory }) {
  const t = T[lang];
  const [docText, setDocText] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [party, setParty] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [parties, setParties] = useState([]);
  const [partiesLoading, setPartiesLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const fileRef = useRef();
  const jLabel = JURISDICTIONS.find(j => j.value === jurisdiction)?.label || jurisdiction;

  useEffect(() => { ensureLibs().catch(() => {}); }, []);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setFileError(""); setFileLoading(true); setDocTitle(file.name.replace(/\.[^.]+$/, "")); setDocText(""); setParties([]); setParty("");
    try {
      const text = await readFileText(file);
      setDocText(text); extractParties(text);
    } catch (err) {
      setFileError(`Could not parse file: ${err.message}. Try saving as .txt or paste directly.`); setDocTitle("");
    }
    setFileLoading(false);
  }, []);

  const handleDrop = useCallback((e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }, [handleFile]);

  const extractParties = async (text) => {
    setParties([]); setParty(""); setPartiesLoading(true);
    try {
      const data = await callClaude(
        [{ role: "user", content: `Extract contracting parties:\n\n${text.slice(0, 6000)}` }],
        `Extract all named contracting parties. Respond ONLY with JSON array (no markdown): [{"name":"Full legal name","role":"their role"}]`
      );
      const raw = data.content?.find(b => b.type === "text")?.text || "[]";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setParties(parsed);
      if (parsed.length > 0) setParty(parsed[0].name);
    } catch { setParties([]); }
    setPartiesLoading(false);
  };

  const analyse = async () => {
    if (!docText.trim() || !party.trim()) { setError(t.noDocError); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const data = await callClaude(
        [{ role: "user", content: `CONTRACT:\n\n${docText}\n\nPARTY: ${party}` }],
        `You are a senior legal analyst under ${jLabel} law. Identify all clauses UNFAVOURABLE to "${party}".
Respond ONLY with valid JSON (no markdown):
{"summary":"2-3 sentence summary","overallRisk":"high|medium|low","issues":[{"id":"issue_1","clause":"name","risk":"high|medium|low","original":"exact text","reason":"why unfavourable","suggested":"improved wording"}]}
Flag: payment terms, liability caps, termination, IP, jurisdiction clauses, indemnification. Order by highest risk.`
      );
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setResult(parsed); setSelectedIssue(parsed.issues?.[0]?.id || null);
      addHistory({ id: Date.now(), title: docTitle || "Contract", party, jurisdiction, result: parsed });
    } catch (e) { setError(t.analysisError + " " + e.message); }
    setLoading(false);
  };

  const activeIssue = result?.issues?.find(i => i.id === selectedIssue);
  const loadFromHistory = (item) => { setResult(item.result); setDocTitle(item.title); setParty(item.party); setSelectedIssue(item.result.issues?.[0]?.id || null); setShowHistory(false); };

  return (
    <div>
      {showHistory && (
        <div style={{ ...S.card, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={S.label}>{t.sessionHistory}</span>
            <button style={{ ...S.btnGhost, padding: "3px 9px", fontSize: 11 }} onClick={() => setShowHistory(false)}>✕</button>
          </div>
          {history.length === 0
            ? <div style={{ fontSize: 13, color: "#4a6a8a" }}>{t.noHistory}</div>
            : history.map(item => (
              <div key={item.id} onClick={() => loadFromHistory(item)}
                style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #1e2d44", marginBottom: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#2e5f9e"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2d44"}>
                <div>
                  <div style={{ fontSize: 14, color: "#c8d8e8" }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: "#4a6a8a", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{item.party} · {JURISDICTIONS.find(j => j.value === item.jurisdiction)?.label}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={S.badge(item.result.overallRisk)}>{item.result.overallRisk}</span>
                  <span style={{ fontSize: 11, color: "#4a6a8a" }}>{item.result.issues?.length} issues</span>
                </div>
              </div>
            ))}
        </div>
      )}

      {!result ? (
        <div className="lexr-grid-2col">
          <div style={S.card}>
            <div style={S.uploadZone(drag)}
              onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
              onDrop={handleDrop} onClick={() => fileRef.current.click()}>
              <div style={{ fontSize: 18, marginBottom: 5 }}>⬆</div>
              <div style={{ fontSize: 13, color: "#c8d8e8", marginBottom: 2 }}>{t.uploadTitle}</div>
              <div style={{ fontSize: 11, color: "#4a6a8a", fontFamily: "'DM Mono', monospace" }}>{t.uploadSub}</div>
              <input ref={fileRef} type="file" accept=".docx,.pdf,.txt,.md" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
            </div>
            <div style={{ margin: "10px 0", textAlign: "center", color: "#4a6a8a", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{t.orPaste}</div>
            <textarea style={{ ...S.textarea, minHeight: 200 }} placeholder={t.pastePlaceholder} value={docText}
              onChange={e => { setDocText(e.target.value); if (!e.target.value.trim()) { setParties([]); setParty(""); } }}
              onBlur={e => { if (e.target.value.trim() && parties.length === 0 && !partiesLoading) extractParties(e.target.value); }} />
            {fileLoading && <div style={{ marginTop: 8 }}><Spinner label={t.parsingDoc} /></div>}
            {fileError && <div style={{ marginTop: 8, background: "#3d1a1a", border: "1px solid #c0392b", borderRadius: 6, padding: "10px 14px", color: "#f5a89a", fontSize: 13 }}>{fileError}</div>}
            {docTitle && !fileError && !fileLoading && <div style={{ marginTop: 8, fontSize: 12, color: "#1e8449", fontFamily: "'DM Mono', monospace" }}>✓ {docTitle} — {docText.length.toLocaleString()} {t.charExtracted}</div>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={S.card}>
              <span style={S.label}>{t.jurisdiction}</span>
              <div style={{ padding: "7px 12px", background: "#0d1117", border: "1px solid #1e2d44", borderRadius: 6, fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#7eb8f7" }}>{jLabel}</div>
              <div style={{ marginTop: 6, fontSize: 11, color: "#4a6a8a", fontFamily: "'DM Mono', monospace" }}>{t.jurisdictionHint}</div>
            </div>

            <div style={S.card}>
              <span style={S.label}>{t.reviewingParty}</span>
              {partiesLoading && <Spinner label={t.detectingParties} />}
              {!partiesLoading && parties.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {parties.map(p => (
                    <div key={p.name} onClick={() => setParty(p.name)}
                      style={{ padding: "9px 12px", borderRadius: 8, border: `2px solid ${party === p.name ? "#2e5f9e" : "#1e2d44"}`, background: party === p.name ? "rgba(46,95,158,0.18)" : "rgba(13,17,23,0.6)", cursor: "pointer", transition: "all 0.15s", flexDirection: "column", gap: 4, display: "flex" }}>
                      <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: party === p.name ? "#7eb8f7" : "#4a6a8a", display: "flex", alignItems: "center", gap: 5 }}>
                        {party === p.name && <span style={{ fontSize: 8 }}>●</span>}{p.role}
                      </div>
                      <div style={{ fontSize: 13, color: party === p.name ? "#c8deff" : "#c8d8e8", fontWeight: party === p.name ? 500 : 400, lineHeight: 1.4 }}>{p.name}</div>
                    </div>
                  ))}
                  <div style={{ marginTop: 2, fontSize: 11, color: "#4a6a8a" }}>{t.customParty}</div>
                  <input style={{ ...S.input, fontSize: 13 }} placeholder={t.customPlaceholder}
                    value={parties.find(p => p.name === party) ? "" : party} onChange={e => setParty(e.target.value)} />
                </div>
              )}
              {!partiesLoading && parties.length === 0 && (
                <input style={S.input} placeholder={docText ? t.noPartyDetected : t.uploadFirst} value={party} onChange={e => setParty(e.target.value)} />
              )}
              <div style={{ marginTop: 8, fontSize: 12, color: "#4a6a8a" }}>{t.partyHint}</div>
            </div>

            {error && <div style={{ background: "#3d1a1a", border: "1px solid #c0392b", borderRadius: 8, padding: "11px 14px", color: "#f5a89a", fontSize: 13 }}>{error}</div>}
            <button style={{ ...S.btn, justifyContent: "center", padding: "13px 20px", opacity: loading ? 0.7 : 1 }} onClick={analyse} disabled={loading}>
              {loading ? <Spinner label={null} /> : <>⚖ {t.analyseBtn}</>}
            </button>
            {history.length > 0 && (
              <button style={{ ...S.btnGhost, justifyContent: "center" }} onClick={() => setShowHistory(s => !s)}>
                ◷ {t.sessionHistory} ({history.length})
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ ...S.card, marginBottom: 16 }} className="lexr-summary-bar">
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a6a8a", marginBottom: 4 }}>{t.execSummary}</div>
              <div style={{ fontSize: 14, color: "#c8d8e8", lineHeight: 1.6 }}>{result.summary}</div>
            </div>
            <div style={{ textAlign: "center", padding: "0 18px", borderLeft: "1px solid #1e2d44" }}>
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a6a8a", marginBottom: 5 }}>{t.overallRisk}</div>
              <span style={S.badge(result.overallRisk)}>{t[result.overallRisk]}</span>
            </div>
            <div style={{ textAlign: "center", padding: "0 18px", borderLeft: "1px solid #1e2d44" }}>
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a6a8a", marginBottom: 5 }}>{t.issuesFound}</div>
              <div style={{ fontSize: 26, fontWeight: 600, color: "#e8e0d0", fontFamily: "'Cormorant Garamond', serif" }}>{result.issues?.length || 0}</div>
            </div>
            <div className="lexr-summary-actions">
              <button style={S.btn} onClick={() => generateDocx(result.issues, party, docTitle, jurisdiction, lang)}>{t.downloadDocx}</button>
              <button style={S.btn} onClick={() => generatePDF(result, party, docTitle, jurisdiction)}>{t.downloadPdf}</button>
              <button style={S.btnGhost} onClick={() => { const b = encodeURIComponent(`LEXR Report\n\nParty: ${party}\nJurisdiction: ${jLabel}\n\n${result.summary}`); window.location.href = `mailto:?subject=LEXR Contract Review&body=${b}`; }}>{t.emailReport}</button>
              <button style={S.btnGhost} onClick={() => { setResult(null); setDocText(""); setDocTitle(""); setParty(""); setParties([]); }}>{t.newAnalysis}</button>
              {history.length > 0 && <button style={S.btnGhost} onClick={() => setShowHistory(s => !s)}>◷ {t.sessionHistory}</button>}
            </div>
          </div>

          <div className="lexr-grid-result">
            <div style={S.card}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a6a8a", marginBottom: 14 }}>{t.flaggedClauses}</div>
              {result.issues?.map(issue => (
                <div key={issue.id} onClick={() => setSelectedIssue(issue.id)}
                  style={{ ...S.issueCard(issue.risk), cursor: "pointer", outline: selectedIssue === issue.id ? `2px solid ${RISK_COLORS[issue.risk].border}` : "none", outlineOffset: 2, transition: "all 0.15s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ fontSize: 13, color: "#c8d8e8", fontWeight: 500, flex: 1 }}>{issue.clause}</div>
                    <span style={S.badge(issue.risk)}>{t[issue.risk]}</span>
                  </div>
                  <div style={{ fontSize: 12, color: RISK_COLORS[issue.risk].text, marginTop: 5, lineHeight: 1.5 }}>{issue.reason.slice(0, 80)}…</div>
                </div>
              ))}
            </div>
            {activeIssue && (
              <div style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a6a8a", marginBottom: 3 }}>{t.clauseDetail}</div>
                    <div style={{ fontSize: 20, fontFamily: "'Cormorant Garamond', serif", color: "#e8e0d0" }}>{activeIssue.clause}</div>
                  </div>
                  <span style={S.badge(activeIssue.risk)}>{t[activeIssue.risk]} risk</span>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a6a8a", marginBottom: 7 }}>{t.whyUnfavourable}</div>
                  <div style={{ fontSize: 14, color: "#c8d8e8", lineHeight: 1.7, background: "rgba(0,0,0,0.2)", padding: "11px 14px", borderRadius: 8, borderLeft: `3px solid ${RISK_COLORS[activeIssue.risk].border}` }}>{activeIssue.reason}</div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a6a8a", marginBottom: 7 }}>{t.originalText}</div>
                  <div style={{ fontSize: 13, color: "#f5a89a", lineHeight: 1.7, background: "rgba(192,57,43,0.08)", padding: "11px 14px", borderRadius: 8, border: "1px solid rgba(192,57,43,0.25)", fontStyle: "italic" }}>"{activeIssue.original}"</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a6a8a", marginBottom: 7 }}>{t.suggestedReform}</div>
                  <div style={{ fontSize: 13, color: "#82e0aa", lineHeight: 1.7, background: "rgba(30,132,73,0.08)", padding: "11px 14px", borderRadius: 8, border: "1px solid rgba(30,132,73,0.25)" }}>{activeIssue.suggested}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Legal Q&A + Negotiate ────────────────────────────────────────────────────
function QATab({ jurisdiction, lang }) {
  const t = T[lang];
  const jLabel = JURISDICTIONS.find(j => j.value === jurisdiction)?.label || jurisdiction;
  const [qaMode, setQaMode] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clauseText, setClauseText] = useState("");
  const [negotiating, setNegotiating] = useState(false);
  const [negotiateResult, setNegotiateResult] = useState(null);
  const fileRef = useRef();
  const bottomRef = useRef();

  const send = async () => {
    if (!input.trim() && !file) return;
    const userMsg = { role: "user", content: file ? `[Attached: ${file.name}]\n\n${input}` : input };
    const updated = [...messages, userMsg];
    setMessages(updated); setInput(""); setFile(null); setLoading(true);
    let fileText = "";
    if (file) { try { fileText = await readFileText(file); } catch {} }
    const apiMessages = updated.map((m, i) => ({ role: m.role, content: i === updated.length - 1 && fileText ? `${m.content}\n\nDOCUMENT:\n${fileText}` : m.content }));
    try {
      const data = await callClaude(apiMessages,
        `You are a senior legal advisor specialising in ${jLabel} law. 1. Give a SHORT strategy (2-3 sentences). 2. List key legal steps. 3. Cite specific legislation with URLs (Ukraine: zakon.rada.gov.ua, EU: eur-lex.europa.eu, US: law.cornell.edu, UK: legislation.gov.uk). 4. Brief AI disclaimer. Use ** for section headers.`);
      setMessages(prev => [...prev, { role: "assistant", content: data.content?.find(b => b.type === "text")?.text || "No response." }]);
    } catch { setMessages(prev => [...prev, { role: "assistant", content: "Request failed." }]); }
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const negotiate = async () => {
    if (!clauseText.trim()) return;
    setNegotiating(true); setNegotiateResult(null);
    try {
      const data = await callClaude(
        [{ role: "user", content: `Original clause:\n\n${clauseText}` }],
        `You are a contract negotiator under ${jLabel} law. Produce 3 alternative negotiation versions.
Respond ONLY with valid JSON (no markdown):
{"clause_summary":"1-sentence summary","positions":[{"stance":"aggressive","label":"Aggressive","rationale":"explanation","text":"full rewritten clause"},{"stance":"balanced","label":"Balanced","rationale":"explanation","text":"full rewritten clause"},{"stance":"conciliatory","label":"Conciliatory","rationale":"explanation","text":"full rewritten clause"}]}`
      );
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      setNegotiateResult(JSON.parse(raw.replace(/```json|```/g, "").trim()));
    } catch (e) { setNegotiateResult({ error: "Failed: " + e.message }); }
    setNegotiating(false);
  };

  const formatMsg = (text) => text.split("\n").map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**"))
      return <div key={i} style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4a6a8a", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 14, marginBottom: 5 }}>{line.replace(/\*\*/g, "")}</div>;
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) => p.startsWith("**") ? <strong key={j} style={{ color: "#7eb8f7" }}>{p.replace(/\*\*/g, "")}</strong> : p);
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    const withLinks = parts.flatMap((part, j) => {
      if (typeof part !== "string") return [part];
      return part.split(urlRegex).map((seg, k) => urlRegex.test(seg) ? <a key={`${j}-${k}`} href={seg} style={{ color: "#7eb8f7", textDecoration: "underline" }} target="_blank" rel="noreferrer">{seg}</a> : seg);
    });
    return <div key={i} style={{ lineHeight: 1.7, marginBottom: 3 }}>{withLinks}</div>;
  });

  const NC = { aggressive: { border: "#c0392b", bg: "rgba(192,57,43,0.08)", col: "#f5a89a" }, balanced: { border: "#2e5f9e", bg: "rgba(46,95,158,0.08)", col: "#7eb8f7" }, conciliatory: { border: "#1e8449", bg: "rgba(30,132,73,0.08)", col: "#82e0aa" } };

  const SUGGESTED_Q = lang === "ua"
    ? ["Які мої права у разі порушення договору?", "Як законно розірвати трудовий договір?", "Що вважається форс-мажором?", "Як захистити інтелектуальну власність?"]
    : ["What are my rights if the counterparty breaches a contract?", "How do I terminate an employment contract legally?", "What constitutes force majeure under local law?", "How to protect IP in a partnership agreement?"];

  return (
    <div className="lexr-grid-qa">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ ...S.tabBar, width: "fit-content" }}>
          <button style={S.tab(qaMode === "chat")} onClick={() => setQaMode("chat")}>💬 {t.tabQA}</button>
          <button style={S.tab(qaMode === "negotiate")} onClick={() => setQaMode("negotiate")}>⚡ {t.negotiateTab}</button>
        </div>

        {qaMode === "chat" ? (
          <>
            <div style={{ ...S.card, minHeight: 380, maxHeight: 500, overflowY: "auto" }}>
              {messages.length === 0 && (
                <div style={{ textAlign: "center", padding: "2.5rem 2rem", color: "#4a6a8a" }}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>⚖</div>
                  <div style={{ fontSize: 15, color: "#6b8aad", marginBottom: 7, fontFamily: "'Cormorant Garamond', serif" }}>{t.qaEmptyTitle}</div>
                  <div style={{ fontSize: 13 }}>{t.qaEmptyBody}</div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} style={{ marginBottom: 16, display: "flex", gap: 10, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: m.role === "user" ? "#1e3a5f" : "#1a2a1a", border: `1px solid ${m.role === "user" ? "#2e5f9e" : "#1e8449"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>
                    {m.role === "user" ? "U" : "⚖"}
                  </div>
                  <div style={{ maxWidth: "84%", background: m.role === "user" ? "rgba(46,95,158,0.15)" : "rgba(19,28,46,0.8)", border: `1px solid ${m.role === "user" ? "#1e3a5f" : "#1e2d44"}`, borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#c8d8e8", lineHeight: 1.7 }}>
                    {m.role === "assistant" ? formatMsg(m.content) : m.content}
                  </div>
                </div>
              ))}
              {loading && <div style={{ display: "flex", gap: 10 }}><div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1a2a1a", border: "1px solid #1e8449", display: "flex", alignItems: "center", justifyContent: "center" }}>⚖</div><div style={{ ...S.card, padding: "10px 14px" }}><Spinner /></div></div>}
              <div ref={bottomRef} />
            </div>
            <div style={S.card}>
              {file && <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8, background: "rgba(46,95,158,0.1)", border: "1px solid #1e3a5f", borderRadius: 6, padding: "5px 10px", fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#7eb8f7" }}>
                📄 {file.name}<button onClick={() => setFile(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#6b8aad", cursor: "pointer" }}>✕</button>
              </div>}
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <textarea style={{ ...S.textarea, minHeight: 54, flex: 1 }} placeholder={t.qaPlaceholder} value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <button style={{ ...S.btnGhost, padding: "8px 11px" }} onClick={() => fileRef.current.click()}>📎</button>
                  <button style={{ ...S.btn, padding: "8px 11px" }} onClick={send} disabled={loading}>↑</button>
                  <input ref={fileRef} type="file" accept=".docx,.pdf,.txt,.md" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={S.card}>
            <div style={{ fontSize: 13, color: "#6b8aad", marginBottom: 14 }}>{t.negotiateHint}</div>
            <textarea style={{ ...S.textarea, minHeight: 110, marginBottom: 12 }} placeholder={t.negotiatePlaceholder} value={clauseText} onChange={e => setClauseText(e.target.value)} />
            <button style={{ ...S.btn, marginBottom: 20 }} onClick={negotiate} disabled={negotiating}>
              {negotiating ? <Spinner label={null} /> : <>⚡ {t.negotiateBtn}</>}
            </button>
            {negotiateResult?.error && <div style={{ background: "#3d1a1a", border: "1px solid #c0392b", borderRadius: 8, padding: "11px 14px", color: "#f5a89a", fontSize: 13 }}>{negotiateResult.error}</div>}
            {negotiateResult && !negotiateResult.error && (
              <div>
                <div style={{ fontSize: 13, color: "#6b8aad", marginBottom: 16, fontStyle: "italic" }}>{negotiateResult.clause_summary}</div>
                {negotiateResult.positions?.map(pos => {
                  const c = NC[pos.stance] || NC.balanced;
                  return (
                    <div key={pos.stance} style={{ border: `1px solid ${c.border}`, background: c.bg, borderRadius: 10, padding: "1rem 1.1rem", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: c.col, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>{pos.label}</div>
                        <div style={{ fontSize: 12, color: "#6b8aad", flex: 1 }}>{pos.rationale}</div>
                      </div>
                      <div style={{ fontSize: 13, color: "#c8d8e8", lineHeight: 1.7, background: "rgba(0,0,0,0.2)", padding: "10px 13px", borderRadius: 7, fontStyle: "italic" }}>"{pos.text}"</div>
                      <button onClick={() => navigator.clipboard?.writeText(pos.text)} style={{ ...S.btnGhost, marginTop: 8, padding: "5px 11px", fontSize: 11 }}>Copy</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={S.card}>
          <div style={S.label}>{t.activeJurisdiction}</div>
          <div style={{ fontSize: 15, color: "#7eb8f7", fontFamily: "'Cormorant Garamond', serif" }}>{jLabel}</div>
          <div style={{ fontSize: 12, color: "#4a6a8a", marginTop: 3 }}>{t.jurisdictionNote} {jLabel}</div>
        </div>
        <div style={S.card}>
          <div style={S.label}>{t.suggestedQ}</div>
          {SUGGESTED_Q.map((q, i) => (
            <div key={i} onClick={() => { setQaMode("chat"); setInput(q); }}
              style={{ padding: "7px 8px", borderRadius: 6, fontSize: 12, color: "#6b8aad", cursor: "pointer", marginBottom: 5, border: "1px solid transparent", transition: "all 0.15s", lineHeight: 1.5 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#1e2d44"; e.currentTarget.style.color = "#c8d8e8"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "#6b8aad"; }}>
              {q}
            </div>
          ))}
        </div>
        <div style={{ ...S.card, background: "rgba(46,95,158,0.06)", borderColor: "#1e3a5f" }}>
          <div style={{ fontSize: 12, color: "#4a6a8a" }}>{t.tip}</div>
        </div>
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("contract");
  const [jurisdiction, setJurisdiction] = useState("ua");
  const [lang, setLang] = useState("ua");
  const [history, setHistory] = useState([]);
  const t = T[lang] || T.en;
  const addHistory = useCallback((item) => setHistory(prev => [item, ...prev.slice(0, 9)]), []);

  const handleJurisdictionChange = (val) => {
    setJurisdiction(val);
    const j = JURISDICTIONS.find(j => j.value === val);
    if (j && !j.langs.includes(lang)) setLang(j.langs[0]);
  };

  const availableLangs = JURISDICTIONS.find(j => j.value === jurisdiction)?.langs || ["en"];

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Crimson+Pro:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #1e2d44; border-radius: 3px; }
        button:hover { opacity: 0.85; } select option { background: #0d1117; }
        .lexr-header-controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
        .lexr-grid-2col { display: grid; grid-template-columns: 1fr 330px; gap: 20px; }
        .lexr-grid-result { display: grid; grid-template-columns: 320px 1fr; gap: 16px; }
        .lexr-grid-qa { display: grid; grid-template-columns: 1fr 250px; gap: 20px; }
        .lexr-summary-bar { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
        .lexr-summary-actions { display: flex; flex-direction: column; gap: 7px; border-left: 1px solid #1e2d44; padding-left: 18px; }
        @media (max-width: 768px) {
          .lexr-grid-2col { grid-template-columns: 1fr !important; }
          .lexr-grid-result { grid-template-columns: 1fr !important; }
          .lexr-grid-qa { grid-template-columns: 1fr !important; }
          .lexr-summary-bar { flex-direction: column; align-items: flex-start; gap: 12px; }
          .lexr-summary-actions { border-left: none; border-top: 1px solid #1e2d44; padding-left: 0; padding-top: 12px; flex-direction: row; flex-wrap: wrap; }
          .lexr-header-controls { gap: 6px; }
          .lexr-hide-mobile { display: none !important; }
        }
      `}</style>

      <header style={S.header}>
        <div style={S.logo}>
          <div style={S.logoMark}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 3 L4 14 L13 14" stroke="#7eb8f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 8 L16 8" stroke="#4a9fd4" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M11 11 L16 11" stroke="#4a9fd4" strokeWidth="1.6" strokeLinecap="round"/>
              <circle cx="16" cy="5" r="2.2" fill="#2e5f9e" stroke="#7eb8f7" strokeWidth="1"/>
              <circle cx="16" cy="5" r="0.8" fill="#7eb8f7"/>
            </svg>
          </div>
          <div>
            <div style={S.logoText}>LEXR</div>
            <div style={S.logoSub} className="lexr-hide-mobile">{t.appSub}</div>
          </div>
        </div>

        <div className="lexr-header-controls">
          <div style={S.tabBar}>
            <button style={S.tab(tab === "contract")} onClick={() => setTab("contract")}>{t.tabContract}</button>
            <button style={S.tab(tab === "qa")} onClick={() => setTab("qa")}>{t.tabQA}</button>
          </div>
          <select style={{ ...S.select, width: "auto" }} value={jurisdiction} onChange={e => handleJurisdictionChange(e.target.value)}>
            {JURISDICTIONS.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
          </select>
          <div style={S.tabBar}>
            {availableLangs.map(l => (
              <button key={l} style={S.tab(lang === l)} onClick={() => setLang(l)}>{LANG_LABELS[l] || l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </header>

      <main style={S.main}>
        {tab === "contract"
          ? <ContractTab jurisdiction={jurisdiction} lang={lang} history={history} addHistory={addHistory} />
          : <QATab jurisdiction={jurisdiction} lang={lang} />}
      </main>

      <footer style={{ borderTop: "1px solid #1e2d44", padding: "14px 2rem", textAlign: "center" }}>
        <span style={{ fontSize: 11, color: "#4a6a8a", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>
          built by{" "}
          <a href="https://jambureau.com/" target="_blank" rel="noreferrer"
            style={{ color: "#6b8aad", textDecoration: "none", borderBottom: "1px solid #2e5f9e" }}>
            jam bureau
          </a>
        </span>
      </footer>
    </div>
  );
}
