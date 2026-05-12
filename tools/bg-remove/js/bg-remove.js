/**
 * toolbase.uz — Background Remove (Optimized)
 * Fully static, no backend, stable module loading
 */

(function() {
    "use strict";

    let originalFile = null;
    let resultBlob = null;
    let modelReady = false;
    let activeBg = "transparent";

    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const modelBanner = document.getElementById("modelBanner");
    const modelProgressBar = document.getElementById("modelProgressBar");
    const processingEl = document.getElementById("processing");
    const resultArea = document.getElementById("resultArea");
    const originalImg = document.getElementById("originalImg");
    const resultImg = document.getElementById("resultImg");
    const downloadBtn = document.getElementById("downloadBtn");
    const newImageBtn = document.getElementById("newImageBtn");
    const toastEl = document.getElementById("toast");

    const swatches = document.querySelectorAll(".swatch");
    const customColorInput = document.getElementById("customColor");

    dropZone.addEventListener("dragover", e => {
        e.preventDefault();
        dropZone.classList.add("drag-over");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("drag-over");
    });

    dropZone.addEventListener("drop", e => {
        e.preventDefault();
        dropZone.classList.remove("drag-over");
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    });

    fileInput.addEventListener("change", () => {
        if (fileInput.files[0]) processFile(fileInput.files[0]);
    });

    swatches.forEach(sw => {
        sw.addEventListener("click", () => {
            swatches.forEach(s => s.classList.remove("active"));
            sw.classList.add("active");
            activeBg = sw.dataset.color || "transparent";
            applyBg();
        });
    });

    customColorInput.addEventListener("input", () => {
        swatches.forEach(s => s.classList.remove("active"));
        document.querySelector(".swatch-custom").classList.add("active");
        activeBg = customColorInput.value;
        applyBg();
    });

    downloadBtn.addEventListener("click", downloadResult);
    newImageBtn.addEventListener("click", resetTool);

    async function processFile(file) {
        if (!file.type.startsWith("image/"))
            return toast("❌ Faqat rasm qabul qilinadi.");

        if (file.size > 20 * 1024 * 1024)
            return toast("❌ 20 MB dan katta fayl bo‘lmaydi.");

        originalFile = file;
        resultBlob = null;

        originalImg.src = URL.createObjectURL(file);

        dropZone.style.display = "none";
        processingEl.classList.add("visible");
        resultArea.classList.remove("visible");

        try {
            const blob = await removeBg(file);
            resultBlob = blob;
            resultImg.src = URL.createObjectURL(blob);

            processingEl.classList.remove("visible");
            resultArea.classList.add("visible");
            applyBg();
        } catch (e) {
            console.error(e);
            toast("❌ Xatolik: model yuklanmadi");
            resetTool();
        }
    }

    async function removeBg(file) {
        if (!modelReady) modelBanner.classList.add("visible");

        // STABLE CDN IMPORT
        const { removeBackground } = await
        import (
            "[cdn.jsdelivr.net](https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/browser.es.js)"
        );

        const config = {
            model: "small",
            output: { format: "image/png" },
            progress: (key, curr, total) => {
                if (!total) return;
                const pct = Math.round((curr / total) * 100);
                modelProgressBar.style.width = pct + "%";
            },
        };

        const res = await removeBackground(file, config);

        modelReady = true;
        modelBanner.classList.remove("visible");
        modelProgressBar.style.width = "0%";

        return res;
    }

    function applyBg() {
        if (!resultBlob) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            if (activeBg !== "transparent") {
                ctx.fillStyle = activeBg;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                blob => {
                    resultBlob = blob;
                    resultImg.src = canvas.toDataURL("image/png");
                },
                "image/png",
                1
            );
        };

        img.src = URL.createObjectURL(resultBlob);
    }

    function downloadResult() {
        if (!resultBlob) return;

        const a = document.createElement("a");
        const name = (originalFile.name || "image").replace(/\.[^.]+$/, "");
        a.href = URL.createObjectURL(resultBlob);
        a.download = name + "-bg.png";
        a.click();

        toast("✅ Yuklab olindi!");
    }

    function resetTool() {
        originalFile = null;
        resultBlob = null;

        originalImg.src = "";
        resultImg.src = "";
        dropZone.style.display = "";
        resultArea.classList.remove("visible");
        processingEl.classList.remove("visible");
        fileInput.value = "";

        swatches.forEach(s => s.classList.remove("active"));
        document.querySelector('[data-color="transparent"]').classList.add("active");
        activeBg = "transparent";
    }

    function toast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add("show");
        setTimeout(() => toastEl.classList.remove("show"), 2500);
    }
})();