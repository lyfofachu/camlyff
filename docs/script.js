/* ══════════════════════════════════════════════════════════════════════════════
   CAMLYFF — CORE ENGINE & DASHBOARD MERGE (JavaScript)
   - Supabase SQL Storage
   - EmailJS Instant Customer Auto-Response & Admin Alert
   - Realtime Merged Admin Dashboard
   - Mobile Friendly Navigation
   ══════════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Supabase Setup ──
  const SUPA_URL = 'https://xsjkffudpkfuzqubyqtk.supabase.co';
  const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzamtmZnVkcGtmdXpxdWJ5cXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjY1NzAsImV4cCI6MjA5Njk0MjU3MH0.w4wk98jsrL7jXRTq06CKH3CovHhuHMVHkL8XDbKsM-0';
  
  let supaClient = null;
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    supaClient = supabase.createClient(SUPA_URL, SUPA_KEY);
    console.log('[CAMLYFF] Supabase initialized');
  }

  // ── EmailJS Credentials & Config ──
  const EJS = {
    publicKey: 'Dxe2BalouabyEtMig',
    serviceId: 'service_ic7q2lg',
    templateId: 'template_et32kwq'
  };
  const ADMIN_EMAIL = 'camlyff005@gmail.com';
  const WHATSAPP_NUM = '919392526227';

  // Camera Gear Rates Catalog
  const GEAR_RATES = {
    'Sony Alpha A7 III': { full: 800, half: 450 },
    'Canon EOS R50': { full: 600, half: 350 },
    'DSLR Starter Kit': { full: 500, half: 300 },
    'Mirrorless Pro Kit': { full: 1200, half: 700 },
    'Gimbal & Lighting Addon': { full: 400, half: 250 },
    'Photography Shoot Session': { full: 1500, half: 900 },
    'Commercial Reel Shoot': { full: 2000, half: 1200 }
  };

  let currentDuration = 'full';
  let adminSessionUser = null;
  let cachedBookings = [];

  // ── Initialize App on DOM Load ──
  document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initDurationPills();
    initGearSelection();
    initBookingCalculator();
    checkAdminSession();
    initEmailJS();
  });

  // ── EmailJS Init ──
  function initEmailJS() {
    if (typeof emailjs !== 'undefined') {
      try {
        emailjs.init({ publicKey: EJS.publicKey });
        console.log('[CAMLYFF] EmailJS initialized');
      } catch (e) {
        console.warn('[EmailJS] Init warning:', e);
      }
    }
  }

  // ── Sticky Header ──
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // ── Mobile Menu Toggle ──
  window.toggleMobileNav = function () {
    const nav = document.getElementById('mobileNavOverlay');
    if (nav) {
      nav.classList.toggle('active');
    }
  };

  // ── Toast Messenger ──
  window.showToast = function (msg, isSuccess = true) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.borderColor = isSuccess ? '#22C55E' : '#EF4444';
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  };

  // ── Gear Quick Select ──
  window.selectGear = function (gearName) {
    const select = document.getElementById('bookService');
    if (select) {
      select.value = gearName;
      updateEstimatedPrice();
    }
    const bookSec = document.getElementById('booking');
    if (bookSec) {
      bookSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ── Duration Pills ──
  function initDurationPills() {
    const pills = document.querySelectorAll('.duration-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentDuration = pill.getAttribute('data-duration') || 'full';
        updateEstimatedPrice();
      });
    });
  }

  function initGearSelection() {
    const select = document.getElementById('bookService');
    if (select) {
      select.addEventListener('change', updateEstimatedPrice);
    }
  }

  function initBookingCalculator() {
    updateEstimatedPrice();
  }

  function updateEstimatedPrice() {
    const select = document.getElementById('bookService');
    const priceDisplay = document.getElementById('estPriceDisplay');
    if (!select || !priceDisplay) return;

    const item = select.value;
    const rates = GEAR_RATES[item] || { full: 600, half: 350 };
    const price = currentDuration === 'half' ? rates.half : rates.full;

    priceDisplay.textContent = '₹' + price.toLocaleString();
    return price;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  //  BOOKING SUBMISSION & AUTOMATED AUTO-RESPONSE EMAIL
  // ══════════════════════════════════════════════════════════════════════════════
  window.handleBookingSubmit = async function (e) {
    if (e) e.preventDefault();

    const name = (document.getElementById('bookName')?.value || '').trim();
    const phone = (document.getElementById('bookPhone')?.value || '').trim();
    const email = (document.getElementById('bookEmail')?.value || '').trim();
    const service = document.getElementById('bookService')?.value || 'Camera Rental';
    const date = document.getElementById('bookDate')?.value || '';
    const notes = (document.getElementById('bookNotes')?.value || '').trim();
    const submitBtn = document.getElementById('btnSubmitBooking');

    if (!name || !phone || !email || !date) {
      showToast('Please fill in Name, Phone, Email and Preferred Date.', false);
      return false;
    }

    const rates = GEAR_RATES[service] || { full: 600, half: 350 };
    const price = currentDuration === 'half' ? rates.half : rates.full;
    const durationLabel = currentDuration === 'half' ? 'Half Day' : 'Full Day';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳ Processing & Dispatching Email...</span>';
    }

    const bookingPayload = {
      name: name,
      phone: phone,
      email: email,
      camera: service,
      service: service,
      date: date,
      duration: durationLabel,
      price: price,
      notes: notes,
      channel: 'website',
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // 1. SAVE TO SUPABASE SQL
    let sqlSaved = false;
    if (supaClient) {
      try {
        const res = await supaClient.from('bookings').insert([bookingPayload]);
        if (!res.error) {
          sqlSaved = true;
          console.log('[Supabase] Booking stored successfully in SQL');
        } else {
          console.warn('[Supabase] Insert warning:', res.error);
        }
      } catch (err) {
        console.error('[Supabase] Insert error:', err);
      }
    }

    // 2. DUAL BACKUP LOCAL STORAGE
    try {
      const local = JSON.parse(localStorage.getItem('camlyff_bookings') || '[]');
      local.unshift(bookingPayload);
      localStorage.setItem('camlyff_bookings', JSON.stringify(local));
    } catch (e) { }

    // 3. AUTOMATED AUTO-RESPONSE EMAIL TO CLIENT VIA EMAILJS
    const emailParams = {
      to_name: name,
      client_email: email,
      to_email: email,
      camera_name: service,
      service: service,
      booking_date: date,
      duration: durationLabel,
      price: '₹' + price,
      phone: phone,
      owner_email: ADMIN_EMAIL,
      reply_to: ADMIN_EMAIL,
      message: `Your booking request for ${service} on ${date} has been confirmed. Our team will connect with you on WhatsApp (${phone}) shortly.`
    };

    if (typeof emailjs !== 'undefined') {
      try {
        // Send Auto-Response confirmation to Customer
        emailjs.send(EJS.serviceId, EJS.templateId, {
          ...emailParams,
          to_email: email,
          to_name: name
        }).then(() => {
          console.log('[Auto-Response] Customer auto-reply email sent to:', email);
        }).catch(err => {
          console.warn('[Auto-Response] Customer auto-reply failed:', err);
        });

        // Send Notification alert to Admin
        emailjs.send(EJS.serviceId, EJS.templateId, {
          ...emailParams,
          to_email: ADMIN_EMAIL,
          to_name: 'CAMLYFF Admin'
        }).then(() => {
          console.log('[EmailJS] Admin alert sent to:', ADMIN_EMAIL);
        }).catch(err => {
          console.warn('[EmailJS] Admin alert failed:', err);
        });
      } catch (err) {
        console.warn('[EmailJS] Execution exception:', err);
      }
    }

    // 4. DISPLAY RECEIPT CONFIRMATION
    showConfirmationModal({
      name,
      service,
      date,
      duration: durationLabel,
      price,
      email,
      phone
    });

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Book Gear & Send Auto-Reply</span>';
    }

    // Clear form
    document.getElementById('bookingForm')?.reset();
    updateEstimatedPrice();
    return false;
  };

  // ── WhatsApp Direct Booking ──
  window.bookViaWhatsApp = function () {
    const name = document.getElementById('bookName')?.value || 'Client';
    const service = document.getElementById('bookService')?.value || 'Camera Rental';
    const date = document.getElementById('bookDate')?.value || 'Upcoming date';
    const dur = currentDuration === 'half' ? 'Half Day' : 'Full Day';
    
    const text = `Hello CAMLYFF Team, I would like to book:\n• Item: ${service}\n• Date: ${date}\n• Duration: ${dur}\n• Name: ${name}`;
    window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // ── Show Confirmation Modal ──
  function showConfirmationModal(b) {
    const modal = document.getElementById('bookingConfirmModal');
    if (!modal) {
      showToast(`Booking received! An automated confirmation email was sent to ${b.email}.`, true);
      return;
    }
    document.getElementById('confName').textContent = b.name;
    document.getElementById('confService').textContent = b.service;
    document.getElementById('confDate').textContent = b.date;
    document.getElementById('confDuration').textContent = b.duration;
    document.getElementById('confPrice').textContent = '₹' + b.price.toLocaleString();
    document.getElementById('confEmail').textContent = b.email;
    modal.classList.add('active');
  }

  window.closeConfirmationModal = function () {
    const modal = document.getElementById('bookingConfirmModal');
    if (modal) modal.classList.remove('active');
  };

  // ══════════════════════════════════════════════════════════════════════════════
  //  MERGED ADMIN DASHBOARD LOGIC (ON-SITE MODAL PORTAL)
  // ══════════════════════════════════════════════════════════════════════════════
  window.openDashboardPortal = function () {
    const modal = document.getElementById('dashboardPortal');
    if (modal) {
      modal.classList.add('active');
      checkAdminSession();
    }
  };

  window.closeDashboardPortal = function () {
    const modal = document.getElementById('dashboardPortal');
    if (modal) modal.classList.remove('active');
  };

  // Switch tabs inside merged dashboard
  window.switchDashTab = function (tabName, btn) {
    document.querySelectorAll('.dash-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.dash-view-pane').forEach(p => p.style.display = 'none');

    if (btn) btn.classList.add('active');
    const pane = document.getElementById(`dashPane-${tabName}`);
    if (pane) pane.style.display = 'block';

    if (tabName === 'bookings') loadAdminBookings();
    if (tabName === 'templates') loadAdminTemplates();
  };

  // Check Supabase Auth
  async function checkAdminSession() {
    if (!supaClient) {
      renderDashAuthUI(false);
      return;
    }
    const res = await supaClient.auth.getSession();
    if (res.data.session) {
      adminSessionUser = res.data.session.user;
      renderDashAuthUI(true);
      loadAdminBookings();
    } else {
      adminSessionUser = null;
      renderDashAuthUI(false);
    }
  }

  function renderDashAuthUI(isLoggedIn) {
    const gate = document.getElementById('dashGateWrap');
    const panel = document.getElementById('dashMainWrap');
    const adminEmailBadge = document.getElementById('dashUserEmailBadge');

    if (isLoggedIn) {
      if (gate) gate.style.display = 'none';
      if (panel) panel.style.display = 'flex';
      if (adminEmailBadge) adminEmailBadge.textContent = adminSessionUser?.email || 'admin@camlyff.com';
    } else {
      if (gate) gate.style.display = 'block';
      if (panel) panel.style.display = 'none';
    }
  }

  // Admin Login Handler
  window.handleAdminLogin = async function (e) {
    if (e) e.preventDefault();
    const email = (document.getElementById('adminLoginEmail')?.value || '').trim();
    const pass = document.getElementById('adminLoginPass')?.value || '';
    const errBox = document.getElementById('adminLoginError');
    const btn = document.getElementById('btnAdminLogin');

    if (errBox) errBox.textContent = '';
    if (btn) { btn.disabled = true; btn.textContent = 'Authenticating...'; }

    if (!supaClient) {
      if (errBox) errBox.textContent = 'Supabase client not initialized.';
      if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
      return false;
    }

    const res = await supaClient.auth.signInWithPassword({ email: email, password: pass });
    if (res.error) {
      if (errBox) errBox.textContent = res.error.message || 'Invalid credentials.';
      if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
      return false;
    }

    adminSessionUser = res.data.user;
    renderDashAuthUI(true);
    showToast('Admin authenticated successfully');
    loadAdminBookings();

    if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
    return false;
  };

  // Admin Logout
  window.handleAdminLogout = async function () {
    if (supaClient) {
      await supaClient.auth.signOut();
    }
    adminSessionUser = null;
    renderDashAuthUI(false);
    showToast('Signed out of Admin Dashboard');
  };

  // Load bookings from Supabase
  window.loadAdminBookings = async function () {
    const tbody = document.getElementById('dashBookingsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:#A8A196;">Loading SQL records...</td></tr>';

    let list = [];
    if (supaClient) {
      const res = await supaClient.from('bookings').select('*').order('created_at', { ascending: false });
      if (!res.error && res.data) {
        list = res.data;
      }
    }

    // Merge with local storage if any
    if (!list.length) {
      list = JSON.parse(localStorage.getItem('camlyff_bookings') || '[]');
    }

    cachedBookings = list;
    renderAdminBookingsTable(list);
    updateDashMetrics(list);
  };

  function renderAdminBookingsTable(list) {
    const tbody = document.getElementById('dashBookingsTableBody');
    if (!tbody) return;

    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:28px;color:#A8A196;">No bookings found in database.</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(b => {
      const statusClass = `status-${b.status || 'pending'}`;
      const dt = b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

      return `
        <tr>
          <td><strong>${b.name || 'Client'}</strong><br><small style="color:#A8A196">${b.email || ''}</small></td>
          <td>${b.phone || '-'}</td>
          <td>${b.camera || b.service || '-'}</td>
          <td>${b.date || '-'}<br><small style="color:#A8A196">${b.duration || ''}</small></td>
          <td><strong>₹${(b.price || 0).toLocaleString()}</strong></td>
          <td><span class="status-badge ${statusClass}">${b.status || 'pending'}</span></td>
          <td>
            <div style="display:flex;gap:6px">
              ${b.status !== 'confirmed' ? `<button onclick="updateBookingState(${b.id}, 'confirmed')" style="background:#22C55E;color:#000;border-radius:4px;padding:3px 8px;font-size:10px;font-weight:700">✓</button>` : ''}
              ${b.status !== 'completed' ? `<button onclick="updateBookingState(${b.id}, 'completed')" style="background:#C084FC;color:#000;border-radius:4px;padding:3px 8px;font-size:10px;font-weight:700">🏁</button>` : ''}
              ${b.status !== 'cancelled' ? `<button onclick="updateBookingState(${b.id}, 'cancelled')" style="background:#EF4444;color:#FFF;border-radius:4px;padding:3px 8px;font-size:10px;font-weight:700">✕</button>` : ''}
              <button onclick="deleteBookingRecord(${b.id})" style="background:#2A2A33;color:#FFF;border-radius:4px;padding:3px 8px;font-size:10px">🗑</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function updateDashMetrics(list) {
    const totalCount = list.length;
    const confirmedCount = list.filter(b => b.status === 'confirmed' || b.status === 'completed').length;
    const pendingCount = list.filter(b => b.status === 'pending').length;
    const revenue = list
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((s, b) => s + (Number(b.price) || 0), 0);

    const mTotal = document.getElementById('metricTotalBookings');
    const mPending = document.getElementById('metricPending');
    const mRevenue = document.getElementById('metricRevenue');

    if (mTotal) mTotal.textContent = totalCount;
    if (mPending) mPending.textContent = pendingCount;
    if (mRevenue) mRevenue.textContent = '₹' + revenue.toLocaleString();
  }

  // Update booking status in Supabase
  window.updateBookingState = async function (id, newStatus) {
    if (supaClient && id) {
      await supaClient.from('bookings').update({ status: newStatus }).eq('id', id);
    }
    // Update local cache
    cachedBookings = cachedBookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
    localStorage.setItem('camlyff_bookings', JSON.stringify(cachedBookings));
    renderAdminBookingsTable(cachedBookings);
    updateDashMetrics(cachedBookings);
    showToast(`Booking marked as ${newStatus}`);
  };

  // Delete booking record
  window.deleteBookingRecord = async function (id) {
    if (!confirm('Permanently delete this booking record?')) return;
    if (supaClient && id) {
      await supaClient.from('bookings').delete().eq('id', id);
    }
    cachedBookings = cachedBookings.filter(b => b.id !== id);
    localStorage.setItem('camlyff_bookings', JSON.stringify(cachedBookings));
    renderAdminBookingsTable(cachedBookings);
    updateDashMetrics(cachedBookings);
    showToast('Record deleted');
  };

  // Search bookings filter
  window.filterAdminBookings = function () {
    const q = (document.getElementById('dashSearchInput')?.value || '').toLowerCase();
    const filtered = cachedBookings.filter(b =>
      (b.name || '').toLowerCase().includes(q) ||
      (b.email || '').toLowerCase().includes(q) ||
      (b.phone || '').toLowerCase().includes(q) ||
      (b.camera || '').toLowerCase().includes(q) ||
      (b.status || '').toLowerCase().includes(q)
    );
    renderAdminBookingsTable(filtered);
  };

  // ── Email Templates Manager in Merged Dashboard ──
  window.loadAdminTemplates = async function () {
    const wrap = document.getElementById('dashTemplatesContainer');
    if (!wrap) return;

    wrap.innerHTML = '<div style="text-align:center;padding:24px;color:#A8A196">Fetching SQL templates...</div>';

    let templates = [
      { id: 1, type: 'booking_confirmation', subject: '✅ Your CAMLYFF Camera Booking Confirmation', body: 'Hi {{name}},\n\nYour camera rental booking has been received!\n\n• Gear: {{camera}}\n• Date: {{date}}\n• Duration: {{duration}}\n• Rate: {{price}}\n\nOur studio manager will reach out on WhatsApp to coordinate pickup.\n\nBest regards,\nCAMLYFF Creative Studio' },
      { id: 2, type: 'admin_notification', subject: '🔔 New Gear Booking Alert: {{name}}', body: 'New booking on website:\n\n• Client: {{name}}\n• Phone: {{phone}}\n• Email: {{email}}\n• Item: {{camera}}\n• Date: {{date}}' }
    ];

    if (supaClient) {
      const res = await supaClient.from('email_templates').select('*');
      if (!res.error && res.data && res.data.length) {
        templates = res.data;
      }
    }

    wrap.innerHTML = templates.map(t => `
      <div style="background:#1B1B22;border:1px solid rgba(250,247,242,0.1);border-radius:12px;padding:20px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;margin-bottom:10px">
          <strong style="color:#C8A97E;text-transform:uppercase;font-size:12px">${t.type}</strong>
        </div>
        <label style="font-size:11px;color:#A8A196;display:block;margin-bottom:4px">SUBJECT</label>
        <input id="tplSubj-${t.id}" class="form-input" value="${(t.subject || '').replace(/"/g, '&quot;')}" style="margin-bottom:12px" />
        <label style="font-size:11px;color:#A8A196;display:block;margin-bottom:4px">BODY TEMPLATE</label>
        <textarea id="tplBody-${t.id}" class="form-textarea" rows="4">${t.body || ''}</textarea>
        <button onclick="saveAdminTemplate(${t.id})" class="btn-primary" style="margin-top:12px;padding:7px 18px;font-size:11px">Save Template</button>
      </div>
    `).join('');
  };

  window.saveAdminTemplate = async function (id) {
    const subj = document.getElementById(`tplSubj-${id}`)?.value;
    const body = document.getElementById(`tplBody-${id}`)?.value;

    if (supaClient) {
      await supaClient.from('email_templates').update({ subject: subj, body: body }).eq('id', id);
    }
    showToast('Template saved to SQL database');
  };

})();