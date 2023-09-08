import GestionnaireLibrairie from "./GestionnaireLibrairie.js";
import GestionnaireDonnees from "./GestionnaireDonnees.js";

export class PanierAchat {
    constructor() {
        this.panier = [];
        const GL = GestionnaireLibrairie.instance;
        this.modalBtn = GL.el.querySelector('[data-js-trigger="shop"]');
        this.modalBox = GL.el.querySelector('[data-js-modal="panier"]');
        this.listeLivre = this.modalBox.querySelector('[data-js-liste-panier]');
        this.elPrix = this.modalBox.querySelector('[data-js-total]');
        this.btnVider = this.modalBox.querySelector('[data-js-trigger="vider"]');
        this.init();
    }

    init() {
        document.addEventListener('ajouterPanier', this.onHandleEvent.bind(this));
        this.modalBtn.addEventListener('click', this.afficherPanier.bind(this));
        this.btnVider.addEventListener('click', this.viderPanier.bind(this));
        const livres = GestionnaireDonnees.recupererDonneesLocales('panier');
        if(livres) livres.forEach(livre => this.ajouterAuPanier(livre));
        this.setPanierHTML();
    }

    onHandleEvent(e) {
        this.ajouterAuPanier(e.detail);
        this.setPanierHTML();
    }

    setPanierHTML() {
        let prixTotal = 0;
        this.listeLivre.innerHTML = '';
        this.panier.forEach(livre => {
            prixTotal += livre.prix;
            const livreInfo = `
                <div class="item">
                    <small>${livre.titre}</small>
                    <div class="prix">${livre.prix}$</div>
                </div>`;
            this.listeLivre.insertAdjacentHTML('beforeend', livreInfo);
        });
        this.elPrix.textContent = prixTotal;
    }

    ajouterAuPanier(livre) {
        this.panier.push(livre);
        GestionnaireDonnees.enregistrerDonneesLocales('panier', this.panier);
    }

    afficherPanier() {
        this.modalBox.classList.toggle('invisible');
    }

    viderPanier() {
        GestionnaireDonnees.supprimerDonneesLocales('panier');
        this.panier = [];
        this.setPanierHTML();
    }

    calculerSousTotal() {}
    calculerTaxes() {}
    calculerTotal() {}
}
