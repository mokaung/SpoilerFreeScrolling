console.log('Popup loaded');

document.getElementById('app')!.innerHTML = `
  <div style="width: 300px; padding: 20px;">
    <h2>Spoiler Blocker</h2>
    <p>Ready to protect you from spoilers!</p>
    <button id="test-btn">Test Extension</button>
  </div>
`;

document.getElementById('test-btn')?.addEventListener('click', () => {
  alert('Extension is working!');
});