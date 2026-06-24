(() => {
    //Modal de confirmación reutilizable
    const STYLE_ID = "mc-style";
    const MODAL_ID = "mc-confirmarModal";

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = `
      /* Modal Confirmación (estética backoffice, sin depender de CSS externos) */
      #${MODAL_ID}{
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.55);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 18px;
      }
      #${MODAL_ID}.mostrar{ display: flex; }

      #${MODAL_ID} .modal{
        background: #ffffff;
        padding: 24px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        max-width: 420px;
        width: 100%;
        text-align: center;
      }
      #${MODAL_ID} .modal p{
        margin-bottom: 18px;
        font-size: 1.1rem;
        color: #222;
      }
      #${MODAL_ID} .modalActions{
        display: flex;
        gap: 12px;
        justify-content: center;
      }

      /* no heredar el width:100% global de button */
      #${MODAL_ID} .modalActions button{
        width: auto;
        min-width: 120px;
        margin-top: 0;
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
        border: none;
      }
      #${MODAL_ID} .modalCancelar{
        background: #757575;
        color: white;
      }
      #${MODAL_ID} .modalConfirmar{
        background: #3dcc84;
        color: white;
      }
    `;
        document.head.appendChild(style);
    }

    function ensureModal() {
        let modal = document.getElementById(MODAL_ID);
        if (modal) return modal;

        modal = document.createElement("div");
        modal.id = MODAL_ID;
        modal.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="mc-text">
        <p id="mc-text"></p>
        <div class="modalActions">
          <button type="button" class="modalConfirmar" id="mc-ok">Confirmar</button>
          <button type="button" class="modalCancelar" id="mc-cancel">Cancelar</button>
        </div>
      </div>
    `;
        document.body.appendChild(modal);
        return modal;
    }

    function confirm(message) {
        ensureStyles();
        const modal = ensureModal();

        const txt = modal.querySelector("#mc-text");
        const okBtn = modal.querySelector("#mc-ok");
        const cancelBtn = modal.querySelector("#mc-cancel");

        txt.textContent = message || "¿Confirmás?";

        return new Promise((resolve) => {
            function cleanup() {
                okBtn.removeEventListener("click", onOk);
                cancelBtn.removeEventListener("click", onCancel);
                modal.removeEventListener("click", onBackdrop);
                document.removeEventListener("keydown", onKeyDown);
            }

            function close(val) {
                cleanup();
                modal.classList.remove("mostrar");
                resolve(val);
            }

            function onOk() { close(true); }
            function onCancel() { close(false); }

            function onBackdrop(e) {
                if (e.target === modal) close(false);
            }

            function onKeyDown(e) {
                if (e.key === "Escape") close(false);
            }

            okBtn.addEventListener("click", onOk);
            cancelBtn.addEventListener("click", onCancel);
            modal.addEventListener("click", onBackdrop);
            document.addEventListener("keydown", onKeyDown);

            modal.classList.add("mostrar");
            okBtn.focus();
        });
    }

    window.__modalConfirm = { confirm };
})();
