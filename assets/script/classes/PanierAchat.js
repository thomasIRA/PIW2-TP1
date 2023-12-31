import GestionnaireLibrairie from "./GestionnaireLibrairie.js";
import GestionnaireDonnees from "./GestionnaireDonnees.js";

/**
 * gère l'affichage et les données du panier d'achat
 */
export class PanierAchat {

    /**
     * utiliser l'instance de GL pour instancier ses éléments HTML, initialiser
     */
    constructor() {
        this.panier = [];
        const GL = GestionnaireLibrairie.instance;
        this.modalBtn = GL.el.querySelector('[data-js-trigger="panier"]');
        this.modalBox = GL.el.querySelector('[data-js-modal="panier"]');
        this.elConteneurListe = this.modalBox.querySelector('[data-js-conteneur="panier-livre"]');
        this.elPanierVide = this.modalBox.querySelector('[data-js-vide]');
        this.elListeHead = this.elConteneurListe.querySelector('hgroup');
        this.elListeLivre = this.modalBox.querySelector('[data-js-liste]');
        this.elTotal = this.modalBox.querySelector('[data-js-total]');
        this.btnVider = this.modalBox.querySelector('[data-js-trigger="vider"]');
        this.prixTotal;
        this.init();
    }

    /**
     * ajouter des gest. d'événements sur les éléments boutons. Récuperer la donnée locale et les ajouter à son panier. Appeler setPanier
     */
    init() {
        this.modalBtn.addEventListener('click', this.afficherPanier.bind(this));
        this.btnVider.addEventListener('click', this.viderPanier.bind(this));

        const livres = GestionnaireDonnees.recupererDonneesLocales('panier');
        if(livres) livres.forEach(livre => this.ajouterAuPanier(livre));
        this.setPanierHTML();
    }

    /**
     * appeler ajouterAuPanier incluant le détail de la donnée passé en param. Appeler setPanier. Enregistrer son panier dans la donnée locale.
     * @param {*} e 
     */
    onHandleEvent(e) {
        this.ajouterAuPanier(e.detail);
        this.setPanierHTML();
        GestionnaireDonnees.enregistrerDonneesLocales('panier', this.panier);
    }

    /**
     * Calculer le sous total et injecter le HTML de chaque item de son panier de livre. Initialiser les boutons pour chaque item. Afficher total
     */
    setPanierHTML() {
        const elHeader = this.elListeHead.querySelector('h4');
        if (this.panier.length == 0){
            this.elConteneurListe.classList.add('non-exist');
            this.elPanierVide.classList.remove('non-exist');
        }
        else {
            this.elConteneurListe.classList.remove('non-exist');
            this.elPanierVide.classList.add('non-exist');
            if (this.panier.length == 1) elHeader.textContent = "Livre";
            else elHeader.textContent = "Livres";
            this.prixTotal = 0;
            this.elListeLivre.innerHTML = '';
            this.panier.forEach((livre, index) => {
                this.prixTotal += livre.prix;
                const livreInfo = `
                    <article>
                        <small>${livre.titre}</small>
                        <div>
                            <span>${livre.prix}$</span>
                            <img data-js-jeter="${index}" src="./assets/icon/trash.png" alt="icon-poubelle" title="enlever l'item">
                        </div>
                    </article>`;
                this.elListeLivre.insertAdjacentHTML('beforeend', livreInfo);
                if (this.elListeLivre.lastElementChild) this.#btnInit(index);
            });
            this.#afficherTotal();
        }
    }

    /**
     * ajouter le livre passé en param dans son panier
     * 
     * @param {*} livre 
     */
    ajouterAuPanier(livre) {
        this.panier.push(livre);
    }

    /**
     * changer la classe Css de son élément boîte modal
     */
    afficherPanier() {
        this.modalBox.classList.toggle('invisible');
    }

    /**
     * supprimer la donnée local du panier. Vider son panier. appeler setPanier
     */
    viderPanier() {
        GestionnaireDonnees.supprimerDonneesLocales('panier');
        this.panier = [];
        this.setPanierHTML();
        this.afficherPanier();
    }

    /**
     * initialiser le bouton de l'élément HTML associé à l'index passé en param. ajouter un gest. d'événement sur le bouton qui supprime de son panier l'item associé au bouton et envoie un événement personnalisé sur le document.
     * @param {*} index 
     */
    #btnInit(index) {
        const btnEnlever = this.elListeLivre.lastElementChild.querySelector(`[data-js-jeter]`);
        btnEnlever.addEventListener('click', (e) => {
            document.dispatchEvent(
                new CustomEvent("enleverPop", { detail: this.panier[index] })
            );
            this.panier.splice(index, 1);
            GestionnaireDonnees.enregistrerDonneesLocales('panier', this.panier);
            this.setPanierHTML();
        });
    }

    /**
     * appeler le calcul de taxes et le calcul total de son prix total. injecter les données dans son élément HTML
     */
    #afficherTotal() {
        let totalHTML;
        const taxes = this.calculerTaxes();
        const total = this.calculerTotal();
        if (this.panier.length == 0) totalHTML = `<p>Votre panier est vide.</p>`;
        else totalHTML = `
            <small>Sous total: ${this.prixTotal} $</small>
            <small>Taxes: ${taxes} $</small>
            <p>Total: ${total} $</p>
        `;
        this.elTotal.innerHTML = totalHTML;
    }

    /**
     * calculer la taxe de son prix total
     * 
     * @returns la taxe de son prix total
     */    
    calculerTaxes() {
        return (this.prixTotal * .15).toFixed(2);
    }

    /**
     * calculer le total(apres taxes) de son prix total
     * 
     * @returns le total de son prix total
     */    
    calculerTotal() {
        return (this.prixTotal * 1.15).toFixed(2);
    }
}
