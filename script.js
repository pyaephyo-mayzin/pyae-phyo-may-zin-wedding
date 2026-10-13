
(() => {
  const c = window.WEDDING_CONFIG;
  if (!c) return;

  const $ = (id) => document.getElementById(id);

  const set = (id, value) => {
    const el = $(id);
    if (el) el.textContent = value;
  };

  // Couple names
  const heroPartner1 = c.displayPartner1 || c.partner1;
  const heroPartner2 = c.displayPartner2 || c.partner2;
  const footerCoupleLine =
    c.footerCoupleLine || `${c.partner1} & ${c.partner2}`;

  set('partner1', heroPartner1);
  set('partner2', heroPartner2);
  set('footerNames', footerCoupleLine);
  set('heroDate', c.dateLabel);
  set('longDate', c.longDate);
  set('eventTime', c.timeLabel);
  set('venue', c.venue);
  set('address', c.address);

  // RSVP deadline
  const deadlineEl = $('rsvpDeadline');
  if (deadlineEl) {
    const highlight =
      '၂၀၂၆ ခုနှစ်၊ အောက်တိုဘာလ ၃၁ ရက်နေ့ နောက်ဆုံးထား၍';

    const parts = (c.rsvpDeadline || '').split(highlight);
    deadlineEl.textContent = '';

    if (parts.length === 2) {
      deadlineEl.append(document.createTextNode(parts[0]));

      const redText = document.createElement('strong');
      redText.style.color = '#FF4D4D';
      redText.textContent = highlight;

      deadlineEl.append(
        redText,
        document.createTextNode(parts[1])
      );
    } else {
      deadlineEl.textContent = c.rsvpDeadline || '';
    }
  }

  $('mapButton').href = c.mapsUrl;

  document.title =
    `${c.partner1} & ${c.partner2} | Wedding Invitation`;

  // Google Calendar
  const utc = (s) =>
    new Date(s)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${c.partner1} & ${c.partner2} Wedding`,
    dates: `${utc(c.weddingDate)}/${utc(c.endDate)}`,
    details: 'We would love to celebrate with you!',
    location: `${c.venue}, ${c.address}`
  });

  $('calendarButton').href =
    `https://calendar.google.com/calendar/render?${params.toString()}`;

  // Order of Celebration
  const schedule = $('timelineList');

  c.schedule.forEach((item) => {
    const entry = document.createElement('article');
    entry.className = 'timeline-entry';

    const time = document.createElement('div');
    time.className = 'timeline-time';
    time.textContent = item.time;

    const info = document.createElement('div');

    const title = document.createElement('h3');
    title.textContent = item.title;

    const subtitle = document.createElement('p');
    subtitle.textContent = item.burmese;

    info.append(title, subtitle);
    entry.append(time, info);
    schedule.append(entry);
  });

  // ==========================================
  // RSVP - Google Sheets
  // ==========================================

  const rsvpForm = $('rsvpForm');
  const status = $('rsvpStatus');
  const submit = $('rsvpSubmit');
  const setupNote = $('rsvpSetupNote');

  const endpoint = c.googleSheetsWebAppUrl || '';

  const ready =
    /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/
      .test(endpoint);

  // Prevent repeated submissions in the same browser
  const submissionKey = `wedding-rsvp-attempt:${endpoint}`;

  const hasAttempt = () => {
    try {
      return localStorage.getItem(submissionKey) === 'sent';
    } catch (_) {
      return false;
    }
  };

  const markAttempt = () => {
    try {
      localStorage.setItem(submissionKey, 'sent');
    } catch (_) {
      // Local storage may be unavailable
    }
  };

  const lockSubmission = () => {
    submit.disabled = true;
    submit.textContent = 'RSVP ALREADY SENT ✓';

    status.className = 'rsvp-status rsvp-success';
    status.textContent =
      'RSVP ပို့ထားပြီးဖြစ်ပါသည်။ ကျေးဇူးတင်ပါတယ်။';
  };

  if (ready && hasAttempt()) {
    lockSubmission();
  }

  if (!ready) {
    submit.disabled = true;
    setupNote.hidden = false;

    status.textContent =
      'RSVP is not open yet. / RSVP ကို မဖွင့်ရသေးပါ။';
  }

  // Show guest count only for attending guests
  const countWrap = $('guestCountWrap');

  const syncAttendance = () => {
    const yes =
      rsvpForm.querySelector(
        'input[name="attendance"]:checked'
      )?.value === 'yes';

    countWrap.hidden = !yes;
    $('guestCount').disabled = !yes;
  };

  rsvpForm
    .querySelectorAll('input[name="attendance"]')
    .forEach((radio) =>
      radio.addEventListener('change', syncAttendance)
    );

  syncAttendance();

  // RSVP submission
  rsvpForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!ready || submit.disabled || hasAttempt()) {
      return;
    }

    const name = $('guestName').value.trim();

    if (!name || name.length > 100) {
      status.textContent =
        'Please enter your name. / အမည်ဖြည့်ပါ။';

      $('guestName').focus();
      return;
    }

    // Spam protection
    if ($('guestWebsite').value) {
      return;
    }

    const attendance =
      rsvpForm.querySelector(
        'input[name="attendance"]:checked'
      )?.value;

    const guestCount =
      attendance === 'yes'
        ? Number($('guestCount').value)
        : 0;

    if (
      !['yes', 'no'].includes(attendance) ||
      guestCount < 0 ||
      guestCount > 10 ||
      (attendance === 'yes' && guestCount < 1)
    ) {
      return;
    }

    const message =
      $('guestMessage').value.trim().slice(0, 500);

    submit.disabled = true;
    submit.textContent = 'SENDING...';

    status.className = 'rsvp-status';
    status.textContent = '';

    try {
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: new URLSearchParams({
          guestName: name,
          attendance: attendance,
          guestCount: String(guestCount),
          message: message,
          website: ''
        })
      });

      // This indicates the browser completed the request.
      // Google Sheets storage is not confirmed by no-cors.
      rsvpForm.reset();
      syncAttendance();

      markAttempt();
      lockSubmission();

    } catch (error) {
      console.error('RSVP submit failed:', error);

      status.className = 'rsvp-status rsvp-error';
      status.textContent =
        'Could not send RSVP. Please try again. / ပို့၍မရပါ။ ထပ်ကြိုးစားပါ။';

    } finally {
      if (!hasAttempt()) {
        submit.disabled = false;
        submit.textContent = 'SEND RSVP ↗';
      }
    }
  });

  // ==========================================
  // Wedding Countdown
  // ==========================================

  const target = new Date(c.weddingDate).getTime();

  const tick = () => {
    const remaining = Math.max(0, target - Date.now());
    const sec = Math.floor(remaining / 1000);

    set(
      'days',
      String(Math.floor(sec / 86400)).padStart(2, '0')
    );

    set(
      'hours',
      String(Math.floor((sec % 86400) / 3600)).padStart(2, '0')
    );

    set(
      'minutes',
      String(Math.floor((sec % 3600) / 60)).padStart(2, '0')
    );

    set(
      'seconds',
      String(sec % 60).padStart(2, '0')
    );

    if (remaining === 0) {
      set('countdownNote', 'Our special day is here ♡');
    }
  };

  tick();
  setInterval(tick, 1000);

  // Scroll animation
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.1 }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    observer.observe(el);
  });

  // Scroll progress
  window.addEventListener(
    'scroll',
    () => {
      const max =
        document.documentElement.scrollHeight - innerHeight;

      $('progress').style.width =
        (max > 0 ? (scrollY / max) * 100 : 0) + '%';
    },
    { passive: true }
  );
})();
