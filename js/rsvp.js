/* WhatsApp RSVP behavior — supports multiple contacts (e.g. Bride & Groom) */
window.initWeddingRSVP = (form, config, names) => {
  const contacts = Array.isArray(config.contacts) && config.contacts.length > 0
    ? config.contacts
    : [{
        name: names || 'Couple',
        phone: config.whatsappPhone || '+91 98765 43210',
        whatsappNumber: String(config.whatsappNumber || '919876543210').replace(/\D/g, '')
      }];

  const hasMultipleContacts = contacts.length > 1;

  form.innerHTML = `
    ${hasMultipleContacts ? `
      <label>Choose RSVP recipient</label>
      <div class="rsvp-contact-options" id="rsvp-contact-options" role="radiogroup" aria-label="Select RSVP recipient">
        ${contacts.map((c, i) => `
          <label class="rsvp-contact-radio">
            <input type="radio" name="recipientIndex" value="${i}" ${i === 0 ? 'checked' : ''}>
            <span class="rsvp-contact-box">
              <span class="rsvp-contact-name">${c.name}</span>
              <span class="rsvp-contact-phone">${c.phone}</span>
            </span>
          </label>
        `).join('')}
      </div>
    ` : ''}

    <label for="rsvp-name">Your Full Name</label>
    <input id="rsvp-name" name="guestName" autocomplete="name" maxlength="120" placeholder="Please enter your full name" required>
    
    <label for="rsvp-attendance">Will you be joining us?</label>
    <select id="rsvp-attendance" name="attendance" required>
      <option value="">Please select your response</option>
      <option value="yes">Joyfully accepts</option>
      <option value="no">Regretfully declines</option>
    </select>
    
    <div id="rsvp-party" hidden>
      <label for="rsvp-count">Number of guests attending</label>
      <input id="rsvp-count" name="guestCount" type="number" min="1" max="20" step="1" value="1" disabled aria-describedby="rsvp-count-help">
      <small id="rsvp-count-help">Including yourself</small>
    </div>

    <label for="rsvp-note">Wishes &amp; Blessings <span style="font-size:13px;opacity:0.75;">(Optional)</span></label>
    <textarea id="rsvp-note" name="guestNote" rows="2" maxlength="300" placeholder="Leave a sweet note for the couple..."></textarea>
    
    <button type="submit" class="action rsvp-link whatsapp-submit-btn">
      <svg class="whatsapp-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" style="vertical-align:middle;margin-right:8px;"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15c-1.52 0-3.01-.41-4.31-1.18l-.31-.18-3.2.84.85-3.12-.2-.32a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.25 8.23zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.35-.77-1.85c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.57c.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/></svg>
      Confirm RSVP via WhatsApp
    </button>

    <div class="whatsapp-direct-wrap" style="text-align:center;margin-top:22px;">
      <p style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.75;margin:0 0 10px;">Direct WhatsApp RSVP</p>
      <div class="whatsapp-direct-list" style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">
        ${contacts.map(c => {
          const cPhone = String(c.whatsappNumber || c.phone).replace(/\D/g, '');
          return `
            <a class="action secondary whatsapp-direct-link" target="_blank" rel="noopener noreferrer" href="https://wa.me/${cPhone}?text=${encodeURIComponent(`Hi ${c.name}, I would like to RSVP for Rhea & Adithya's wedding on November 21st, 2026!`)}">
              ${c.name}: ${c.phone}
            </a>
          `;
        }).join('')}
      </div>
    </div>

    <p class="rsvp-help" role="status">Your response will open in WhatsApp. Please tap 'Send' to confirm!</p>
  `;

  const name = form.querySelector('#rsvp-name');
  const attendance = form.querySelector('#rsvp-attendance');
  const count = form.querySelector('#rsvp-count');
  const party = form.querySelector('#rsvp-party');
  const note = form.querySelector('#rsvp-note');
  const help = form.querySelector('.rsvp-help');

  const sync = () => {
    const attending = attendance.value === 'yes';
    party.hidden = !attending;
    count.disabled = !attending;
    count.required = attending;
  };

  attendance.addEventListener('change', sync);
  name.addEventListener('input', () => name.setCustomValidity(''));
  sync();

  form.addEventListener('submit', event => {
    event.preventDefault();
    name.setCustomValidity(name.value.trim() ? '' : 'Please enter your full name.');
    if (!form.reportValidity()) return;

    const attending = attendance.value === 'yes';
    const guestName = name.value.trim();
    const guestCount = attending ? count.value : '0';
    const guestNote = note.value.trim();

    const selectedRadio = form.querySelector('input[name="recipientIndex"]:checked');
    const contactIdx = selectedRadio ? parseInt(selectedRadio.value, 10) : 0;
    const targetContact = contacts[contactIdx] || contacts[0];
    const targetPhone = String(targetContact.whatsappNumber || targetContact.phone).replace(/\D/g, '');

    let text = `*Wedding RSVP — ${names}*\n`;
    text += `📅 Saturday, 21 November 2026 · Bolgatty Event Center, Kochi\n\n`;
    text += `*To:* ${targetContact.name}\n`;
    text += `*Guest Name:* ${guestName}\n`;
    text += `*Attendance:* ${attending ? 'Joyfully accepts' : 'Regretfully declines'}\n`;
    if (attending) {
      text += `*Number of Guests:* ${guestCount}\n`;
    }
    if (guestNote) {
      text += `*Message:* ${guestNote}\n`;
    }
    text += `\nSent with love via wedding invitation.`;

    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
    help.textContent = `Opening WhatsApp to send your RSVP to ${targetContact.name} (${targetContact.phone}). Thank you!`;
  });
};
