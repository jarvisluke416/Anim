document.addEventListener('DOMContentLoaded', () => {
  const previewContainer = document.getElementById('previewContainer');
  const animationPlayer = document.getElementById('animationPlayer');
  const playBtn = document.getElementById('playBtn');
  const speedSlider = document.getElementById('speedSlider');
  const speedLabel = document.getElementById('speedLabel');

  let playing = false, playInterval = null, currentFrame = 0, frameDelay = 1000; // Default delay of 1 second

  speedSlider.addEventListener('input', () => {
    frameDelay = parseInt(speedSlider.value);
    speedLabel.textContent = (frameDelay / 1000).toFixed(1) + 's/frame'; // Display seconds in label
    if (playing) restartPlayback(); // Restart playback if already playing
  });

  function addPreview() {
    const section = document.createElement('div');
    section.className = 'accordion-section';
    
    const header = document.createElement('div');
    header.className = 'accordion-header';
    const title = document.createElement('h4');
    title.textContent = `Preview ${previewContainer.children.length + 1}`;
    const toggle = document.createElement('span');
    toggle.textContent = '+';
    const minimizeBtn = document.createElement('button');
    minimizeBtn.textContent = '–';
    minimizeBtn.style.marginLeft = '10px';

    header.appendChild(title);
    header.appendChild(toggle);
    header.appendChild(minimizeBtn);

    const content = document.createElement('div');
    content.className = 'accordion-content';

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'controls';
    controlsDiv.innerHTML = `
      <div class="symbolsContainer"></div>
      <button class="addSymbolBtn">Add Symbol +</button>
      <div class="imagesContainer" style="margin-top:10px;"></div>
      <button class="addImageBtn">Add Image +</button>
      <div class="settings" style="margin-top:10px;">
        <label>Font:
          <select class="fontSelect">
            <option value="Arial" selected>Arial</option>
            <option value="Michroma">Michroma</option>
            <option value="Pacifico">Pacifico</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
          </select>
        </label>
      </div>
      <div class="panel-grid" id="panelContainer"></div>
    `;

    const preview = document.createElement('div');
    preview.className = 'preview';
    const textarea = document.createElement('textarea');
    textarea.readOnly = true;

    content.appendChild(controlsDiv);
    content.appendChild(preview);
    content.appendChild(document.createElement('br'));
    content.appendChild(textarea);

    section.appendChild(header);
    section.appendChild(content);
    previewContainer.appendChild(section);

    const previewObj = {
      section, header, content, preview, textarea,
      controlsDiv,
      symbolsContainer: controlsDiv.querySelector('.symbolsContainer'),
      imagesContainer: controlsDiv.querySelector('.imagesContainer'),
      fontSelect: controlsDiv.querySelector('.fontSelect')
    };

    header.addEventListener('click', (e) => {
      if (e.target === minimizeBtn) return;
      const active = section.classList.contains('active');
      document.querySelectorAll('.accordion-section').forEach(sec => sec.classList.remove('active'));
      if (!active) section.classList.add('active');
    });
    minimizeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
    });

    controlsDiv.querySelector('.addSymbolBtn').addEventListener('click', () => addSymbol(previewObj));
    controlsDiv.querySelector('.addImageBtn').addEventListener('click', () => addImage(previewObj));
    previewObj.fontSelect.addEventListener('change', () => updatePreview(previewObj));

    updatePreview(previewObj);
  }

  document.getElementById('addPreviewBtn').addEventListener('click', addPreview);
  addPreview();

  // ---- SYMBOLS ----
  function addSymbol(previewObj) {
    const div = document.createElement('div');
    div.className = 'input-group';
    div.dataset.top = 50;
    div.dataset.left = 50;
    div.innerHTML = `
      <input type="text" maxlength="3" class="symbolInput" placeholder="Symbol"/>
      <select class="unicodeSelect">
        <option value="">-- Unicode --</option>
        <option value="★">★ Star</option>
        <option value="✿">✿ Flower</option>
        <option value="☯">☯ Yin Yang</option>
        <option value="♡">♡ Heart</option>
        <option value="☀">☀ Sun</option>
        <option value="⚡">⚡ Lightning</option>
      </select>
      <input type="number" class="angleSelect" value="0" style="width:50px"/>°
      <input type="number" class="fontSizeInput" value="40" style="width:60px"/>px
      <input type="color" class="colorInput" value="#000000"/>
      <button class="moveUp">↑</button>
      <button class="moveDown">↓</button>
      <button class="moveLeft">←</button>
      <button class="moveRight">→</button>
      <button class="removeBtn">✖</button>
    `;
    previewObj.symbolsContainer.appendChild(div);

    const moveStep = 2;
    const updateSymbol = () => updatePreview(previewObj);
    const move = (dx, dy) => {
      div.dataset.left = parseFloat(div.dataset.left) + dx;
      div.dataset.top = parseFloat(div.dataset.top) + dy;
      updateSymbol();
    };

    div.querySelectorAll('input, select').forEach(el => el.addEventListener('input', updateSymbol));
    div.querySelector('.moveUp').addEventListener('click', () => move(0, -moveStep));
    div.querySelector('.moveDown').addEventListener('click', () => move(0, moveStep));
    div.querySelector('.moveLeft').addEventListener('click', () => move(-moveStep, 0));
    div.querySelector('.moveRight').addEventListener('click', () => move(moveStep, 0));
    div.querySelector('.removeBtn').addEventListener('click', () => { div.remove(); updateSymbol(); });
  }

  // ---- IMAGES ----
  function addImage(previewObj) {
    const div = document.createElement('div');
    div.className = 'input-group';
    div.dataset.top = 50;
    div.dataset.left = 50;
    div.dataset.scale = 1;
    div.dataset.rotation = 0;
    div.innerHTML = `
      <input type="text" class="imageURLInput" placeholder="Enter image URL" style="width:250px;"/>
      <button class="applyImg">✔️</button>
      <button class="moveUp">↑</button>
      <button class="moveDown">↓</button>
      <button class="moveLeft">←</button>
      <button class="moveRight">→</button>
      <button class="sizeUp">＋</button>
      <button class="sizeDown">－</button>
      <button class="rotateLeft">⟲</button>
      <button class="rotateRight">⟳</button>
      <button class="removeBtn">✖</button>
    `;
    previewObj.imagesContainer.appendChild(div);

    const moveStep = 2, scaleStep = 0.1, rotateStep = 10;
    const updateImage = () => updatePreview(previewObj);
    const move = (dx, dy) => {
      div.dataset.left = parseFloat(div.dataset.left) + dx;
      div.dataset.top = parseFloat(div.dataset.top) + dy;
      updateImage();
    };

    div.querySelector('.applyImg').addEventListener('click', updateImage);
    div.querySelector('.moveUp').addEventListener('click', () => move(0, -moveStep));
    div.querySelector('.moveDown').addEventListener('click', () => move(0, moveStep));
    div.querySelector('.moveLeft').addEventListener('click', () => move(-moveStep, 0));
    div.querySelector('.moveRight').addEventListener('click', () => move(moveStep, 0));
    div.querySelector('.sizeUp').addEventListener('click', () => { div.dataset.scale = parseFloat(div.dataset.scale) + scaleStep; updateImage(); });
    div.querySelector('.sizeDown').addEventListener('click', () => { div.dataset.scale = Math.max(0.1, parseFloat(div.dataset.scale) - scaleStep); updateImage(); });
    div.querySelector('.rotateLeft').addEventListener('click', () => { div.dataset.rotation = parseFloat(div.dataset.rotation) - rotateStep; updateImage(); });
    div.querySelector('.rotateRight').addEventListener('click', () => { div.dataset.rotation = parseFloat(div.dataset.rotation) + rotateStep; updateImage(); });
    div.querySelector('.removeBtn').addEventListener('click', () => { div.remove(); updateImage(); });
  }

  // ---- UPDATE PREVIEW ----
  function updatePreview(previewObj) {
    const { preview, textarea, symbolsContainer, imagesContainer, fontSelect } = previewObj;
    preview.innerHTML = '';

    symbolsContainer.querySelectorAll('.input-group').forEach(div => {
      const sym = div.querySelector('.symbolInput').value.trim() || div.querySelector('.unicodeSelect').value;
      if (!sym) return;
      const span = document.createElement('span');
      span.textContent = sym;
      span.style.fontSize = div.querySelector('.fontSizeInput').value + 'px';
      span.style.color = div.querySelector('.colorInput').value;
      span.style.fontFamily = fontSelect.value;
      span.style.top = div.dataset.top + '%';
      span.style.left = div.dataset.left + '%';
      span.style.transform = `translate(-50%, -50%) rotate(${div.querySelector('.angleSelect').value}deg)`;
      preview.appendChild(span);
    });

    imagesContainer.querySelectorAll('.input-group').forEach(div => {
      const url = div.querySelector('.imageURLInput').value.trim();
      if (!url) return;
      const img = document.createElement('img');
      img.src = url;
      img.style.top = div.dataset.top + '%';
      img.style.left = div.dataset.left + '%';
      img.style.transform = `translate(-50%, -50%) scale(${div.dataset.scale}) rotate(${div.dataset.rotation}deg)`;
      preview.appendChild(img);
    });

    textarea.value = `<div style="position:relative;width:100%;aspect-ratio:5/3;">${preview.innerHTML}</div>`;
  }

  // ---- Animation ----
  function restartPlayback() {
    if (playing) {
      clearInterval(playInterval);
      playAnimation();
    }
  }

  let lastFrameTime = 0;

  function playAnimation() {
    const previews = Array.from(previewContainer.querySelectorAll('.preview'));
    if (previews.length === 0) return;

    playing = true;
    playBtn.textContent = '⏹ Stop';
    currentFrame = 0;

    function renderFrame(timestamp) {
      if (!lastFrameTime) lastFrameTime = timestamp;

      const timeDifference = timestamp - lastFrameTime;

      if (timeDifference >= frameDelay) {
        animationPlayer.innerHTML = '';
        const frame = previews[currentFrame].cloneNode(true);
        frame.classList.add('frameFade');
        frame.style.position = 'absolute';
        frame.style.top = 0;
        frame.style.left = 0;
        animationPlayer.appendChild(frame);

        lastFrameTime = timestamp;
        currentFrame = (currentFrame + 1) % previews.length;
      }

      if (playing) {
        requestAnimationFrame(renderFrame);
      }
    }

    requestAnimationFrame(renderFrame);
  }

  playBtn.addEventListener('click', () => {
    if (!playing) playAnimation();
    else {
      playing = false;
      clearInterval(playInterval);
      playBtn.textContent = '▶ Play';
    }
  });
});
