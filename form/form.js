 // ---------- helpers ----------
  const $ = id => document.getElementById(id);
  const showToast = (msg) => {
    const t = $('toast');
    $('toastText').textContent = msg;
    t.classList.add('show');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(()=> t.classList.remove('show'), 2600);
  };

  const setupImageDrop = (dropEl, inputEl, onFile) => {
    dropEl.addEventListener('click', () => inputEl.click());
    inputEl.addEventListener('change', () => {
      if(inputEl.files[0]) onFile(inputEl.files[0]);
    });
    ['dragover','dragenter'].forEach(evt => dropEl.addEventListener(evt, e => {
      e.preventDefault(); dropEl.classList.add('drag');
    }));
    ['dragleave','drop'].forEach(evt => dropEl.addEventListener(evt, e => {
      e.preventDefault(); dropEl.classList.remove('drag');
    }));
    dropEl.addEventListener('drop', e => {
      const file = e.dataTransfer.files[0];
      if(file) onFile(file);
    });
  };

  // ---------- CH.01 identity picture ----------
  const picPreview = $('picPreview');
  const pvAvatar = $('pvAvatar');
  setupImageDrop($('picDrop'), $('picInput'), (file) => {
    const reader = new FileReader();
    reader.onload = e => {
      picPreview.innerHTML = `<img src="${e.target.result}" alt="Picture preview">`;
      pvAvatar.innerHTML = `<img src="${e.target.result}" alt="">`;
    };
    reader.readAsDataURL(file);
  });

  $('bizName').addEventListener('input', e => {
    $('pvName').textContent = e.target.value || 'Your business name';
  });

  // ---------- CH.02 bio ----------
  $('bioText').addEventListener('input', e => {
    $('bioCount').textContent = `${e.target.value.length} / 120`;
    $('pvBio').textContent = e.target.value || 'Your short bio will appear here.';
  });

  // ---------- CH.03 about ----------
  $('aboutText').addEventListener('input', e => {
    $('aboutCount').textContent = `${e.target.value.length} / 600`;
    $('pvAbout').textContent = e.target.value || 'Your about text will show up here once you write it.';
  });

  // ---------- CH.04 contact ----------
  const updateContactPreview = () => {
    const parts = [$('cEmail').value, $('cPhone').value, $('cAddress').value].filter(Boolean);
    $('pvContact').innerHTML = parts.length ? parts.join('<br>') : '— not yet added —';
  };
  ['cEmail','cPhone','cAddress','cSocial'].forEach(id => $(id).addEventListener('input', updateContactPreview));

  // ---------- CH.05 podcast ----------
  const audioDrop = $('audioDrop');
  const audioInput = $('audioInput');
  const audioChip = $('audioChip');
  const setAudioFile = (file) => {
    $('audioName').textContent = file.name;
    audioChip.classList.add('show');
  };
  audioDrop.addEventListener('click', () => audioInput.click());
  audioInput.addEventListener('change', () => { if(audioInput.files[0]) setAudioFile(audioInput.files[0]); });
  ['dragover','dragenter'].forEach(evt => audioDrop.addEventListener(evt, e => { e.preventDefault(); audioDrop.classList.add('drag'); }));
  ['dragleave','drop'].forEach(evt => audioDrop.addEventListener(evt, e => { e.preventDefault(); audioDrop.classList.remove('drag'); }));
  audioDrop.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if(f) setAudioFile(f); });
  $('audioRemove').addEventListener('click', () => {
    audioInput.value = ''; audioChip.classList.remove('show');
  });

  let episodeCount = 0;
  $('addEpisode').addEventListener('click', () => {
    const title = $('epTitle').value.trim();
    if(!title){ showToast('Add an episode title first'); return; }
    episodeCount++;
    const item = document.createElement('div');
    item.className = 'queue-item';
    item.innerHTML = `<div class="qi-left"><span class="qi-dot"></span>${title}</div><span class="qi-meta">${$('epLength').value || '—'} · queued</span>`;
    $('episodeQueue').appendChild(item);
    updatePreviewTags();
    showToast(`"${title}" added to podcast page queue`);
    $('epTitle').value=''; $('epLength').value=''; $('epDesc').value='';
    audioInput.value=''; audioChip.classList.remove('show');
  });

  // ---------- CH.06 dashboard / main segment ----------
  setupImageDrop($('segDrop'), $('segInput'), (file) => {
    const reader = new FileReader();
    reader.onload = e => {
      $('segDrop').innerHTML = `<img src="${e.target.result}" alt="Segment cover">`;
    };
    reader.readAsDataURL(file);
  });

  let segmentCount = 0;
  $('addSegment').addEventListener('click', () => {
    const title = $('segTitle').value.trim();
    if(!title){ showToast('Add a segment title first'); return; }
    segmentCount++;
    const item = document.createElement('div');
    item.className = 'queue-item';
    item.innerHTML = `<div class="qi-left"><span class="qi-dot"></span>${title}</div><span class="qi-meta">${$('segCategory').value || '—'} · queued</span>`;
    $('segmentQueue').appendChild(item);
    updatePreviewTags();
    showToast(`"${title}" added to dashboard queue`);
    $('segTitle').value=''; $('segCategory').value=''; $('segDesc').value='';
  });

  const updatePreviewTags = () => {
    const tags = [];
    if(episodeCount) tags.push(`${episodeCount} podcast ${episodeCount===1?'episode':'episodes'}`);
    if(segmentCount) tags.push(`${segmentCount} main ${segmentCount===1?'segment':'segments'}`);
    $('pvTags').innerHTML = tags.map(t => `<span class="pv-tag">${t}</span>`).join('');
  };

  // ---------- final save ----------
  $('saveDetails').addEventListener('click', () => {
    showToast('Details saved as draft — generation comes next');
  });

  // ---------- sidebar active-state scroll spy ----------
  const links = document.querySelectorAll('.channel-list a');
  const sections = [...links].map(l => document.querySelector(l.getAttribute('href')));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const id = '#' + entry.target.id;
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  sections.forEach(s => s && spy.observe(s));