/* ===================================================================
   커미션 신청서 페이지 (request.html) 전용 스크립트
   - 커미션 종류: 태그 단일 선택
   - 추가 옵션: +버튼으로 여러 개 추가/제거
   - 작성 내용 -> 이미지(PNG)로 저장 -> 구글 폼 링크로 이동
   =================================================================== */

// TODO: 구글 폼을 만든 뒤 이 URL을 실제 폼 주소로 교체하세요.
// (폼 편집 화면에서 "보내기" -> 링크 아이콘으로 URL 복사)
const GOOGLE_FORM_URL = 'https://forms.gle/REPLACE_WITH_YOUR_FORM_ID';

let selectedAddons = []; // { label, value } 목록, 같은 종류 중복 추가 가능

document.addEventListener('DOMContentLoaded', () => {
    const googleFormLink = document.getElementById('googleFormLink');
    if (googleFormLink) {
        googleFormLink.href = GOOGLE_FORM_URL;
    }

    setupTypeTags();
    setupAddonButtons();

    const saveImageBtn = document.getElementById('saveImageBtn');
    if (saveImageBtn) {
        saveImageBtn.addEventListener('click', saveRequestAsImage);
    }

    const kakaoPayBtn = document.getElementById('kakaoPayBtn');
    if (kakaoPayBtn) {
        kakaoPayBtn.addEventListener('click', openKakaoQr);
    }
});

/* --- 카카오페이 QR 팝업 --- */
function openKakaoQr() {
    const modal = document.getElementById('kakaoQrModal');
    if (!modal) return;
    modal.classList.remove('is-hidden');
    document.body.style.overflow = 'hidden';
}

function closeKakaoQr() {
    const modal = document.getElementById('kakaoQrModal');
    if (!modal) return;
    modal.classList.add('is-hidden');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeKakaoQr();
});

/* --- 커미션 종류: 태그 단일 선택 --- */
function setupTypeTags() {
    const group = document.getElementById('typeTagGroup');
    const hiddenInput = document.getElementById('reqType');
    if (!group || !hiddenInput) return;

    group.querySelectorAll('.tag-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            group.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            hiddenInput.value = chip.dataset.value;
            group.closest('.form-row').classList.remove('has-error');
        });
    });
}

/* --- 추가 옵션: +버튼으로 여러 개 추가 --- */
function setupAddonButtons() {
    const addButtons = document.querySelectorAll('.addon-add-btn');
    const selectedGroup = document.getElementById('addonSelected');
    if (!addButtons.length || !selectedGroup) return;

    addButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.dataset.value;
            const label = btn.dataset.label;
            selectedAddons.push({ label, value });
            renderAddonChips();
        });
    });

    renderAddonChips();
}

function renderAddonChips() {
    const selectedGroup = document.getElementById('addonSelected');
    selectedGroup.innerHTML = '';

    selectedAddons.forEach((addon, index) => {
        const chip = document.createElement('span');
        chip.className = 'tag-chip addon-chip';
        chip.innerHTML = `${addon.label} <button type="button" class="addon-remove-btn" aria-label="제거">×</button>`;
        chip.querySelector('.addon-remove-btn').addEventListener('click', () => {
            selectedAddons.splice(index, 1);
            renderAddonChips();
        });
        selectedGroup.appendChild(chip);
    });
}

function getFormValues() {
    const form = document.getElementById('requestForm');
    if (!form) return null;

    return {
        name: form.reqName.value.trim(),
        contact: form.reqContact.value.trim(),
        type: form.reqType.value,
        addons: selectedAddons.map(a => a.value),
        character: form.reqChar.value.trim(),
        deadline: form.reqDeadline.value.trim(),
        reference: form.reqRef.value.trim(),
        note: form.reqNote.value.trim(),
    };
}

function saveRequestAsImage() {
    const form = document.getElementById('requestForm');
    const hint = document.getElementById('formHint');
    const typeRow = document.getElementById('typeTagGroup').closest('.form-row');

    if (!form.reportValidity()) {
        return;
    }
    if (!form.reqType.value) {
        typeRow.classList.add('has-error');
        typeRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const data = getFormValues();
    const canvas = document.getElementById('requestCanvas');
    const ctx = canvas.getContext('2d');

    const width = 900;
    const padding = 48;
    const lineHeight = 30;
    const labelFont = '700 15px "Noto Sans KR", sans-serif';
    const valueFont = '400 17px "Noto Sans KR", sans-serif';
    const titleFont = '700 26px "Noto Sans KR", sans-serif';

    const fields = [
        { label: '이름 / 닉네임', value: data.name },
        { label: '연락처', value: data.contact },
        { label: '커미션 종류', value: data.type },
        { label: '추가 옵션', value: data.addons.length ? data.addons.join(', ') : '-' },
        { label: '캐릭터 / 리퀘스트 내용', value: data.character },
        { label: '희망 마감일', value: data.deadline || '-' },
        { label: '레퍼런스 링크', value: data.reference || '-' },
        { label: '추가 메모', value: data.note || '-' },
    ];

    ctx.font = valueFont;
    const maxTextWidth = width - padding * 2;

    function wrapText(text, font) {
        ctx.font = font;
        const words = text.split(/\s+/);
        const lines = [];
        let current = '';
        words.forEach(word => {
            const test = current ? current + ' ' + word : word;
            if (ctx.measureText(test).width > maxTextWidth && current) {
                lines.push(current);
                current = word;
            } else {
                current = test;
            }
        });
        if (current) lines.push(current);
        return lines.length ? lines : [''];
    }

    let totalHeight = padding + 46 + 24;
    const wrappedFields = fields.map(f => {
        const lines = wrapText(f.value || '-', valueFont);
        const blockHeight = 22 + lines.length * lineHeight + 22;
        totalHeight += blockHeight;
        return { ...f, lines, blockHeight };
    });
    totalHeight += padding;

    canvas.width = width;
    canvas.height = Math.max(totalHeight, 400);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#304ffe';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    let y = padding + 32;
    ctx.fillStyle = '#111111';
    ctx.font = titleFont;
    ctx.fillText('커미션 신청서', padding, y);
    ctx.font = '400 13px "Noto Sans KR", sans-serif';
    ctx.fillStyle = '#888888';
    ctx.fillText('Patohsi Commission Request', padding, y + 20);
    y += 20 + 30;

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
    y += 34;

    wrappedFields.forEach(f => {
        ctx.font = labelFont;
        ctx.fillStyle = '#304ffe';
        ctx.fillText(f.label, padding, y);
        y += 22;

        ctx.font = valueFont;
        ctx.fillStyle = '#222222';
        f.lines.forEach(line => {
            ctx.fillText(line, padding, y);
            y += lineHeight;
        });
        y += 22;
    });

    ctx.font = '400 12px "Noto Sans KR", sans-serif';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('이 이미지를 구글 폼에 첨부해 제출해 주세요.', padding, canvas.height - 20);

    const link = document.createElement('a');
    const safeName = (data.name || 'request').replace(/[\\/:*?"<>|]/g, '_');
    link.download = `commission_request_${safeName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    if (hint) {
        hint.textContent = '이미지가 저장되었습니다. 이제 "구글 폼으로 신청하기" 버튼을 눌러 업로드해 주세요.';
        hint.classList.add('form-hint-success');
    }
}
