function renderDashboard(progress = []) {
  const completed = progress.length;
  const percent = Math.round((completed / 12) * 100);

  return {
    title: "Sound Literacy Player Dashboard",
    progress: `${completed}/12`,
    percentage: percent,
    level: completed >= 12 ? "Responsible Sound Creator" : "Sound Explorer",
    status: completed >= 12 ? "Certificate Unlocked" : "Learning in Progress"
  };
}
