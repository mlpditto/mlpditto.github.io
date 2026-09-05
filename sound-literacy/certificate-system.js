const CERTIFICATE_RULE = {
  requiredLessons: 12,
  title: "Certificate of Completion",
  course: "Sound Literacy Academy"
};

function checkCertificate(completedLessons = []) {
  return completedLessons.length >= CERTIFICATE_RULE.requiredLessons;
}

function generateCertificateData(completedLessons = []) {
  return {
    unlocked: checkCertificate(completedLessons),
    title: CERTIFICATE_RULE.title,
    course: CERTIFICATE_RULE.course,
    completed: completedLessons.length,
    total: CERTIFICATE_RULE.requiredLessons,
    skills: [
      "Sound Literacy",
      "Sound Psychology",
      "Sound Ethics",
      "Copyright Awareness",
      "Responsible Creation"
    ]
  };
}
