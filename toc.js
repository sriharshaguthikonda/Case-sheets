(function () {
  document.addEventListener('DOMContentLoaded', function () {
    // Hide the static fallback TOC — JS is working
    var staticToc = document.getElementById('toc-static');
    if (staticToc) staticToc.style.display = 'none';

    var headings = Array.from(document.querySelectorAll('h2, h3, h4'))
      .filter(function (h) { return h.textContent.trim() && !h.closest('#toc'); });

    if (!headings.length) return;

    headings.forEach(function (h, i) { if (!h.id) h.id = 'h-' + i; });

    var style = document.createElement('style');
    style.textContent = [
      '#toc {',
      '  position: fixed; top: 8px; left: 8px;',
      '  width: 215px; max-height: 90vh; overflow-y: auto;',
      '  background: #f5f5f5; border: 1px solid #bbb;',
      '  padding: 8px 10px; box-sizing: border-box;',
      '  font-size: 0.8em; z-index: 9999;',
      '  box-shadow: 2px 2px 8px rgba(0,0,0,0.18);',
      '}',
      '#toc-toggle { cursor: pointer; font-weight: bold; user-select: none; }',
      '#toc ul { list-style: none; margin: 4px 0 0; padding: 0; }',
      '#toc li a { text-decoration: none; color: #222; display: block; padding: 2px 0; line-height: 1.3; }',
      '#toc li a:hover { color: #0055cc; }',
      '#toc .toc-h2 { font-weight: bold; margin-top: 5px; }',
      '#toc .toc-h3 { padding-left: 12px; }',
      '#toc .toc-h4 { padding-left: 22px; color: #555; font-size: 0.95em; }',
      'body.dark #toc, body[data-theme="dark"] #toc {',
      '  background: #1e1e1e; border-color: #444; color: #ccc;',
      '}',
      'body.dark #toc li a, body[data-theme="dark"] #toc li a { color: #ccc; }'
    ].join('\n');
    document.head.appendChild(style);

    var nav = document.createElement('nav');
    nav.id = 'toc';

    var toggle = document.createElement('div');
    toggle.id = 'toc-toggle';
    toggle.textContent = '\u2630 Contents';
    nav.appendChild(toggle);

    var ul = document.createElement('ul');
    headings.forEach(function (h) {
      var li = document.createElement('li');
      li.className = 'toc-' + h.tagName.toLowerCase();
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent.trim();
      a.addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById(h.id).scrollIntoView({ behavior: 'smooth' });
      });
      li.appendChild(a);
      ul.appendChild(li);
    });

    nav.appendChild(ul);
    toggle.addEventListener('click', function () {
      ul.style.display = ul.style.display === 'none' ? '' : 'none';
    });

    document.body.appendChild(nav);
  });
})();
