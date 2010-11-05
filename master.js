/** BEGIN PACKAGE.JS **/

var IS_IE = document.all && window.print && !window.opera && /MSIE [56]/.test(navigator.userAgent);
var IS_IE7 = document.all && window.print && !window.opera && /MSIE [78]/.test(navigator.userAgent);
var IS_IE_ALL = document.all && window.print && !window.opera && /MSIE/.test(navigator.userAgent);
var IE_W3C = IS_IE && /MSIE [789]/.test(navigator.userAgent);
var IS_Webkit = /Konqueror|Safari|KHTML/.test(navigator.userAgent);
var heightPropertyToUse = IS_IE ? "height" : "minHeight";

/* ecrit les classes dans le tag HTML, pas besoin d'attendre le chargement du body */
document.documentElement.className += " hasJS"; //cette classe rajoute une classe CSS qui permet des actions afin de cacher ou afficher des elements seulement pour les visiteurs qui ont le Javascript active sur leur navigateur. (exemple le hidesubmit)
if (IS_IE) 
	document.documentElement.className+=" IS_IE"; //cette classe permet d'utiliser des hacks CSS/JS seulement pour IE6 et versions inferieures.
else if (IS_IE7)
	document.documentElement.className+=" IS_IE7"; //cette classe permet d'utiliser des hacks CSS/JS seulement pour IE7
/*
 * Fonctions globales
 */

function getElementsByClassName(oElm, sTagName, sClassName) {
  var aElements = (sTagName == "*" && oElm.all)? oElm.all : oElm.getElementsByTagName(sTagName);
  var aReturnElements = new Array();
  sClassName = sClassName.replace(/\-/g, "\\-");
  var oRegExp = new RegExp("(^|\\s)" + sClassName + "(\\s|$)");
  var oElement;
  for(var i=0; i < aElements.length; i++)
  {
    oElement = aElements[i];
    if(oRegExp.test(oElement.className))
    aReturnElements.push(oElement);
  }
  return aReturnElements
}

function findPos(obj){
    var curleft = curtop = 0;
    if (obj.offsetParent) {
        curleft = obj.offsetLeft
        curtop = obj.offsetTop
        while (obj = obj.offsetParent) {
            curleft += obj.offsetLeft
            curtop += obj.offsetTop
        }
    }
    return [curleft, curtop];
}

/*  intStyleJ  : Récupère la valeur numerique d'une propriété CSS */
function intStyleJ(obj,cssProperty){
	var val = parseInt($(obj).css(cssProperty));
	if (isNaN(val))
		val = 0;
	
	return val;
}

/*
 * Fonction Resize : redimensionne un element avec un effet
 * size ( element, actionsWidth:object, heightWidth:object, timer:int, pitch:int);
 */
function resize(obj, actionWidth, actionHeight, timer, pitch, funcWhile, funcAfter, inBoucle){
    var endWidth = false;
    var endHeight = false;
    if (actionWidth) {
        if (!inBoucle) 
            obj.style.width = actionWidth.start + "px";
        if ((pitch >= 0 && obj.offsetWidth < actionWidth.end) || (pitch < 0 && obj.offsetWidth > actionWidth.end)) 
            obj.style.width = actionWidth.start + pitch + "px";
        if ((pitch >= 0 && obj.offsetWidth >= actionWidth.end) || (pitch <= 0 && obj.offsetWidth <= actionWidth.end)) {
            obj.style.width = actionWidth.end + "px";
            endWidth = true;
        }
    } else {
        endWidth = true;
    }
    if (actionHeight) {
        if (!inBoucle) 
            obj.style.height = actionHeight.start + "px";
        if ((pitch >= 0 && obj.offsetHeight < actionHeight.end) || (pitch < 0 && obj.offsetHeight > actionHeight.end)) 
            obj.style.height = actionHeight.start + pitch + "px";
        if ((pitch >= 0 && obj.offsetHeight >= actionHeight.end) || (pitch <= 0 && obj.offsetHeight <= actionHeight.end)) {
            obj.style.height = actionHeight.end + "px";
            endHeight = true;
        }
    } else {
        endHeight = true;
    }
    if (funcWhile) 
        funcWhile();
    if (endWidth && endHeight) {
        if (funcAfter) 
            funcAfter();
        return;
    }
    setTimeout(function(){
        resize(obj, actionWidth ? {
            start: obj.offsetWidth,
            end: actionWidth.end
        } : null, actionHeight ? {
            start: obj.offsetHeight,
            end: actionHeight.end
        } : null, timer, pitch, funcWhile, funcAfter, true)
    }, timer);
}

/*************
* Fonctions pour fixer les coins sous IE
* Une fonctions est prevue aussi pour Safari 2.0, Opera 8.5 et FF 1.0 pour certains cas
**************/
var CSSBottomCorners=[]; //array pouvant contenir les coins absolu positionnes en bottom
var currentBlockToFixCorners=null; //variable gloable utilisee lorsqu'on veux fixer les coins sur un seul bloc
/*  cssRight :
	fixe les coins positionnes en absolu a droite
	ex :
		body.IS_IE .tr {right:expression(addHover(this))}
		Il faut afin que cela fonctionne, avoir declare le right dans un selecteur precedent (pour les autres navigateurs).
		ex : .tr {height:5px;  width:5px; right:0}
		Afin de ne pas prendre en compte IE7 en mode strict il suffit de placer la classe .IS_IE avant, cette classe est ajoutee pendant le chargement de la page et n'est ajoutee que pour IE5.x ou 6.
*/
function cssRight(elm) {
	elm.style.right=(parseInt(elm.currentStyle.right)-(elm.parentNode.offsetWidth%2))+"px";
}

/*  cssBottom :  (comme CSS right avec un parametre supplementaire)
	fixe les coins positionnes en absolu a droite
	ex :
		body.IS_IE .br {bottom:expression(addHover(this))}
	Il faut afin que cela fonctionne, avoir declare le right dans un selecteur precedent (pour les autres navigateurs).
	Afin de ne pas prendre en compte IE7 en mode strict il suffit de placer la classe .IS_IE avant, cette classe est ajoutee pendant le chargement de la page et n'est ajoutee que pour IE5.x ou 6.

	Si on veut rajouter ces coins dans un array qui permettra de les refixer si le bloc s'agrandit ou autre. il suffit de rajouter "true" dans les parametres.
	ex :
		body.IS_IE .br {bottom:expression(addHover(this, true))}
*/
function cssBottom(elm, pushElement) {
	if (pushElement && !elm.CSSBottomAlreadyCSS) {
		CSSBottomCorners.push(elm);
		elm.CSSBottomAlreadyCSS=true;
	}
	elm.style.bottom=(parseInt(elm.currentStyle.bottom)-(elm.parentNode.offsetHeight%2))+"px";
}
/** END PACKAGE.JS **/


/* fixCorners :
 * Cette fonction  est appelee lorsque l'on doit fixer tous les coins d'une page ou d'un block.
 * ex :
 * 	fixCorners ();  //Lance la fonction pour fixer tous les blocks, il faut lancer la fonction une fois la page chargee.
 * 	fixCorners(block); //en passant un element en parametre, le traitement ne se fera que sur le bloc et non sur toute la page.
 */
function fixCorners(block){
    if (IS_IE) {
        for (i = CSSBottomCorners.length - 1; i > -1; --i) {
            CSSBottomCorners[i].style.bottom = "";
        }
    } else {
        if (IS_Webkit || /Gecko\/200[56]|Opera 8.5/i.test(navigator.userAgent)) 
            fixCornersOnBlocks(block);
    }
}

/* fixCornersOnBlocks :
 *  Ajoute une classe CSS hidecorners afin de cacher les coins puis les reafficher.
 *  Cette fonction n'est lancee que pour Safari, Le moteur Gecko 2005 (FF1.0) et Opera 8.5), car lorsqu'on agrandit un block en Javascript, les coins en absolu positionnes en bas restent a leur place. Cette fonction corrige le probleme.
 */
function fixCornersOnBlocks(block){
    currentBlockToFixCorners = block || document.body;
    currentBlockToFixCorners.className += " hidecorners";
    setTimeout("fixCornersOnBlocksShowCorners()", 5);
}

/* fixCornersOnBlocksShowCorners :
 *  Fonction associee a fixCornersOnBlocks(), cette fonction retire la classe hidecorners qui a ete appliquee a currentBlockToFixCorners
 */
function fixCornersOnBlocksShowCorners(){
    if (currentBlockToFixCorners) 
        currentBlockToFixCorners.className = currentBlockToFixCorners.className.replace(/\bhidecorners\b/g, "");
    currentBlockToFixCorners = null;
}


/* Alignement en hauteur
 *  Les fonctions qui suivent alignent les blocs et les contenus en hauteur
 *  Hashmaps contenant des references de blocks qui doivent etre traites
 */
var arrLineOfMiseEnAvant = [];
var arrLineOfAlignedProduct = [];
var arrBlocksInCol = [];
var arrLineOfBigBlock = [];
var arrLineOfAddressBlock = [];


/* findListParent :
 * retourne le LI parent d'un element passe en parametre
 * var li = findListParent(element)
 */
function findListParent(elm){
    var li = elm
    while (li.nodeName != "LI") 
        li = li.parentNode;
    return li;
}


/* getAllBlocks :
 * cette fonction rempli des arrays (hashmaps) avec les blocks qui devront etre traites, elle est lancee pendant le chargement de la page,
 * le traitement des blocks se fait une fois la page charge en un temps tres courts par les fonctions fixMiseEnAvant, fixAligneProduits, fixBlocksHeight (ces fonctions doivent etre lancees dans l'ordre cite).
 */
function getAllBlocks(){
    var content = document.body;
    if (!content) 
        return;
    var div = content.getElementsByTagName("div");
    for (var i = 0; i < div.length; i++) {
        var line = div[i];
        if (/\bline_[2345]cols/.test(line.className)) { /*on cherche les lignes*/
            var h3Inside = line.getElementsByTagName("h2");
            var divInside = line.getElementsByTagName("div");
            if (/\baligner_produits\b/.test(line.className)) {
                arrLineOfAlignedProduct.push(line);
                line.blocks = [];
            }
            for (var j = 0; j < divInside.length; j++) {
                var block = divInside[j]; /* on recupere les blocks */
                var h3 = h3Inside[j];
                if (/\bblock\b/.test(block.className)) {
                    if (/\bmise_en_avant\b/.test(block.className)) { /* Si block mise_en_avant */
                        if (!line.alreadyAdded) { /* on initialise un array de block afin que le traitement soit plus rapide une fois la page chargee */
                            arrLineOfMiseEnAvant.push(line);
                            line.alreadyAdded = true;
                        }
                        if (!line.miseEnAvantBlocks) {
                            line.miseEnAvantBlocks = [];
                        }
                        line.miseEnAvantBlocks.push(block);
                    }
                    if (/\bblk_inside gradient flat\b/.test(block.className)) { /* Si block mise_en_avant */
                        if (!line.alreadyAdded) { /* on initialise un array de block afin que le traitement soit plus rapide une fois la page chargee */
                            arrLineOfBigBlock.push(line);
                            line.alreadyAdded = true;
                        }
                        if (!line.miseEnAvantBlocks) {
                            line.miseEnAvantBlocks = [];
                        }
                        line.miseEnAvantBlocks.push(block);
                    }
                    if (/\bblk_address\b/.test(block.className)) { /* Si block mise_en_avant */
                        if (!line.alreadyAdded) { /* on initialise un array de block afin que le traitement soit plus rapide une fois la page chargee */
                            arrLineOfAddressBlock.push(line);
                            line.alreadyAdded = true;
                        }
                        if (!line.miseEnAvantBlocks) {
                            line.miseEnAvantBlocks = [];
                        }
                        line.miseEnAvantBlocks.push(block);
                    }
                    if (line.blocks) {
                        line.blocks.push(block);
                    }
                    if (!/\bnoresize\b/.test(block.className)) {
                        arrBlocksInCol.push(block);
                    }
                    block.lineContainer = line;
                }
            }
        }
    }
}


/*  fixMiseEnAvant :
 *	Aligne les contenus des blocks de mise en avant quand ceux-ci sont dans un conteneur ligne.
 */
function fixMiseEnAvant(){
    for (var i = 0; i < arrLineOfMiseEnAvant.length; i++) {
        var line = arrLineOfMiseEnAvant[i];
        /* on cherche d'abord l'ensemble des elements qui devronts etre alignes */
        var imgs = [];
		var resume = [];
		var links = [];
		var market = []; // MP!
		var footer = [];
        var h3 = line.getElementsByTagName("h2");
		var dd = line.getElementsByTagName("dd");
		var div = line.getElementsByTagName("div");
        var prix = [];
        var maxOffset = 0;
        
        for (var j = 0; j < dd.length; j++) {
            var y = dd[j];
            if (y.className.match(/\bimg\b/)) {
                imgs.push(y);
                y.isImage = true;
            }
            if (y.className.match(/\bresume\b/)) 
                resume.push(y);
            if (y.className.match(/\bprix\b/)) 
                prix.push(y);
            if (y.className.match(/\blinks\b/)) 
                links.push(y);
			if (y.className.match(/\bshomeMV\b/)) 
                market.push(y);
        }
		for (var d=0; d<div.length; d++) {
			var o=div[d];
			if (o.className.match(/\bblk_footer\b/)) footer.push(o);
		}
        /* on traite les img a part
         /* aligner les elements */
        var arrOfArrElements = [h3, imgs, resume, prix, links, market, footer];//attention a l'ordre
        var maxImgHeight = 0;
        var maxH3Height = 0;
		var maxDivHeight = 0; // MP !
		var maxUlHeight = 0;
		var maxResumeHeight = 0;
        for (var j = 0; j < arrOfArrElements.length; j++) {
            var arrTmp = arrOfArrElements[j];
            maxOffset = 0;
			for (var k = 0; k < arrTmp.length; k++) {
                var current = arrTmp[k];
                if (current.offsetTop > maxOffset) 
                    maxOffset = current.offsetTop;
                if (current.isImage) {
                    if (current.offsetHeight >= maxImgHeight) {
                        maxImgHeight = current.offsetHeight;
                    }
                }
                if (current.className == "blk_header") {
                    if (current.offsetHeight >= maxH3Height) {
                        maxH3Height = current.offsetHeight;
                    }
                }
				if (current.className.match(/\bresume\b/)) {
					if(current.offsetHeight >= maxResumeHeight) maxResumeHeight = current.offsetHeight;
				}
				if (current.className.match(/\bshomeMV\b/)) { // MP!
					if (current.offsetTop>=maxOffset) { maxOffset = current.offsetTop; }
				}
				if (current.className.match(/\bblk_footer\b/) && current.nodeName == "DIV") {
					var fSet = current.offsetHeight - (intStyleJ(current, "padding-top")+intStyleJ(current, "padding-bottom"));
					if (fSet>=maxUlHeight) { maxUlHeight = fSet; }
				}
            }
            for (var k = 0; k < arrTmp.length; k++) {
                var current = arrTmp[k];
                if (current.isImage) {
                    var currentHeight = current.offsetHeight;
                    var heightToApply = maxImgHeight - currentHeight;
                    var topToApply = parseInt(heightToApply / 2);
                    var bottomToApply = heightToApply - topToApply;
					intStyleJ(current,"margin-top");
					current.style.paddingTop = intStyleJ(current, "padding-top") + topToApply + "px";
                    current.style.paddingBottom = intStyleJ(current, "padding-bottom") + bottomToApply + "px";
                    current.style.marginTop = intStyleJ(current, "margin-top") + (maxOffset - current.offsetTop) + "px";
				}
                else 
                    if (current.className == "blk_header") {
                        var currentHeight = current.offsetHeight;
                        var heightToApply = maxH3Height - currentHeight;
                        var topToApply = parseInt(heightToApply / 2);
                        var bottomToApply = heightToApply - topToApply;
                        current.childNodes[0].style.paddingTop = intStyleJ(current.childNodes[0], "padding-top") + topToApply + "px";
                        current.childNodes[0].style.paddingBottom = intStyleJ(current.childNodes[0], "padding-bottom") + bottomToApply + "px";
                    } else if (current.className.match(/\bresume\b/)) {
						current.style.paddingBottom = (maxResumeHeight - current.offsetHeight)+"px";
					} else if (current.className.match(/\bprix\b/)) {
                        current.style.marginTop = (maxOffset - current.offsetTop) + "px";
                    } else if (current.className.match(/\bshomeMV\b/)) { // MP !
						current.style.marginTop = (maxOffset - current.offsetTop) + "px";
					} else if (current.className.match(/\bblk_footer\b/) && current.nodeName == "DIV") {
						current.style[heightPropertyToUse]  = maxUlHeight+"px";
					} else {
						current.style.paddingTop = (maxOffset - current.offsetTop) + "px";
					}
            }
        }
    }
}


/*  fixAligneProduits :
 *	Aligne les listes de produits quand 2 a 3 blocs sont contenus dans une ligne ayant la classe "aligner_produits".
 *	ex : <div class="line_2cols aligner_produits">
 */
function fixAligneProduits(){
    var maxLengthLinks = 0;
    var maxLengthProduits = 0;
    var maxOffset = 0;
    var maxHeight = 0;
    for (var i = 0; i < arrLineOfAlignedProduct.length; i++) { /*on parcours les lignes */
        var line = arrLineOfAlignedProduct[i];
        for (var j = 0; j < line.blocks.length; j++) { /* puis les lignes de chaque  block */
            var block = line.blocks[j];
            block.linksBlocks = [];
            var dd = block.getElementsByTagName("dd");
            
            if (block.linksBlocks.length > maxLengthLinks) 
                maxLengthLinks = block.linksBlocks.length;
            block.produits = [];
            var li = block.getElementsByTagName("li");
            for (var k = 0; k < li.length; k++) {
                if (li[k].parentNode.className.match(/\blisteproduits\b/)) 
                    block.produits.push(li[k]);
            }
            if (block.produits.length > maxLengthProduits) 
                maxLengthProduits = block.produits.length;
        }
        for (var j = 0; j < maxLengthProduits; j++) { /* on parcoure les tableaux de produit, puis les blocks pour aligner les contenus.  */
            maxHeight = 0;
            for (var k = 0; k < line.blocks.length; k++) {
                if (j < line.blocks[k].produits.length) {
                    var current = line.blocks[k].produits[j];
                    if (current.offsetHeight > maxHeight) 
                        maxHeight = current.offsetHeight;
                }
            }
            for (var k = 0; k < line.blocks.length; k++) {
                if (j < line.blocks[k].produits.length) {
                    var current = line.blocks[k].produits[j];
                    current.style[heightPropertyToUse] = maxHeight - intStyleJ(current, "padding-top") - intStyleJ(current, "padding-bottom") + "px";
                }
            }
        }
    }
}

/*
 * fixAddressBlock;
 */
function fixAddressBlock(){
    for (var i = 0; i < arrLineOfAddressBlock.length; i++) {
        var line = arrLineOfAddressBlock[i];
        var lks = [];
        var ul = line.getElementsByTagName("ul");
        var maxOffset = 0;
        for (var j = 0; j < ul.length; j++) {
            var y = ul[j];
            if (y.className.match(/\blks\b/)) 
                lks.push(y);
        }
        
        for (var k = 0; k < lks.length; k++) {
            var current = lks[k];
            if (current.offsetTop > maxOffset) {
                maxOffset = current.offsetTop;
            } else {
                current.style.marginTop = ((maxOffset) - current.offsetTop) + "px";
            }
            current.style.height = '2em';
        }
    }
}

/*  fixBlocksHeight :
 *	Aligne tous les blocks en hauteur.
 */
function fixBlocksHeight(){
    var content;
    for (var i = 0; i < arrBlocksInCol.length; i++) {
        content = null;
        var b = arrBlocksInCol[i];
        var div = b.getElementsByTagName("div");
        for (var j = 0; j < div.length; j++) {
            if (div[j].className.match(/\bblk_content\b/)) { /* on recupere le blk_content, du block */
                content = div[j];
                break;
            }
        }
        if (content) {
            /* on defini la nouvelle hauteur du block via, une simple soustraction : hauteur_content+(hauteu_ligne-hauteur_Block)-paddings */
            content.style[heightPropertyToUse] = content.offsetHeight + (b.lineContainer.offsetHeight - b.offsetHeight) - (intStyleJ(content, "padding-top") + intStyleJ(content, "padding-bottom")) + "px";
        }
    }
}

/* Alignement des listes :
 * listes en ligne et listes en colonne ou un element sur 2 est sur la droite ou la gauche
 */
var listes_inline = [];
var listes_2cols = [];

/* getAllLists :
 *  Recupère toutes les listes de produits ou contacts afin de les traiter apres
 */
function getAllLists(){
    var ul = document.getElementsByTagName("ul");
    for (var i = 0; i < ul.length; i++) {
        var x = ul[i];
        x.listItems = [];
        if (x.offsetHeight > 0) {
            if (x.className.match(/\b(produits_conseilles|liste_inline|liste_3cols)\b/)) {
                listes_inline.push(x);
                for (var j = 0; j < x.childNodes.length; j++) {
                    var y = x.childNodes[j];
                    if (y.nodeType == 1 && y.nodeName == "LI") {
                        x.listItems.push(y);
                    }
                }
                
                //on recupere le block de liens qui se trouve dans la liste
                x.linksItems = [];
                x.evalItems = [];
                if (x.className.match(/\bproduits_conseilles\b/)) {
                    var ul2 = x.getElementsByTagName("ul");
                    for (var j = 0; j < ul2.length; j++) {
                        var y = ul2[j];
                        if (y.className.match(/\blinks\b/)) {
                            x.linksItems.push(y);
                        }
                    }
                } else {
                    //  dans le cas d'une liste en ligne, on n'alignement pas les links d'acces au produit, mais on aligne les evaluations
                    if (x.className.match(/\bliste_inline\b/)) {
                        var div = x.getElementsByTagName("div");
                        for (var j = 0; j < div.length; j++) {
                            var y = div[j];
                            if (y.className.match(/\beval\b/)) {
                                x.evalItems.push(y);
                            }
                        }
                    }
                }
            } else 
                if (x.className.match(/\bliste_2cols\b/)) {
                    listes_2cols.push(x);
                    x.itemsLeft = [];
                    x.itemsRight = [];
                    counter = 0;
                    for (var j = 0; j < x.childNodes.length; j++) {
                        var y = x.childNodes[j];
                        if (y.nodeType == 1 && y.nodeName == "LI") {
                            var dd = y.getElementsByTagName("dd");
                            for (var k = 0; k < dd.length; k++) {
                                var z = dd[k];
                                if (z.className.match(/\blinks\b/)) {
                                    y.linksBlock = z;
                                }
                            }
                            if (counter % 2) {
                                x.itemsRight.push(y);
                            }
                            else {
                                x.itemsLeft.push(y);
                            }
                            counter++;
                        }
                    }
                }
        }
    }
}

/* fixListeInline */
function fixListeInline(){
    for (var i = 0; i < listes_inline.length; i++) {
        var x = listes_inline[i];
        var maxHeight = 0;
        for (var j = 0; j < x.listItems.length; j++) {
            var y = x.listItems[j];
            if (y.offsetHeight > maxHeight) 
                maxHeight = y.offsetHeight;
        }
        for (var j = 0; j < x.listItems.length; j++) {
            var y = x.listItems[j];
            y.style[heightPropertyToUse] = maxHeight - intStyleJ(y, "padding-top") - intStyleJ(y, "padding-bottom") + "px";
        }
        if (x.linksItems && x.linksItems.length > 0) {
            var arr = x.linksItems;
            var maxOffset = 0;
            for (var j = 0; j < arr.length; j++) {
                var y = arr[j];
                if (y.offsetTop > maxOffset) 
                    maxOffset = y.offsetTop;
            }
            for (var j = 0; j < arr.length; j++) {
                var y = arr[j];
                y.style.paddingTop = intStyleJ(y, "padding-top") + (maxOffset - y.offsetTop) + "px";
            }
        }
		
        if (x.evalItems && x.evalItems.length > 0) {
            var arr = x.evalItems;
            var maxOffset = 0;
            for (var j = 0; j < arr.length; j++) {
                var y = arr[j];
                var li = findListParent(y);
                var offsetTop = findPos(y)[1] - findPos(li)[1];
                y.specialOffsetTop = offsetTop;
                if (offsetTop > maxOffset) 
                    maxOffset = offsetTop;
            }
            for (var j = 0; j < arr.length; j++) {
                var y = arr[j];
                y.style.marginTop = (maxOffset - y.specialOffsetTop) + "px";
            }
        }
    }
}


/* fixListe2cols */
function fixListe2cols(){
    for (var i = 0; i < listes_2cols.length; i++) {
        var x = listes_2cols[i];
        for (var j = 0; j < x.itemsLeft.length; j++) {
            var l = x.itemsLeft[j];
            var r = x.itemsRight[j];
            var maxOffset = l.linksBlock.offsetTop > r.linksBlock.offsetTop ? l.linksBlock.offsetTop : r.linksBlock.offsetTop;
            l.linksBlock.style.paddingTop = intStyleJ(l.linksBlock, "padding-top") + (maxOffset - l.linksBlock.offsetTop) + "px";
            r.linksBlock.style.paddingTop = intStyleJ(r.linksBlock, "padding-top") + (maxOffset - r.linksBlock.offsetTop) + "px";
            var heightStuff = intStyleJ(l, "padding-top") + intStyleJ(l, "padding-bottom") + intStyleJ(l, "border-top-width") + intStyleJ(l, "border-bottom-width")
            l.style[heightPropertyToUse] = r.style[heightPropertyToUse] = (l.offsetHeight >= r.offsetHeight ? l.offsetHeight : r.offsetHeight) - heightStuff + "px";
        }
    }
}


/*
 * Fin alignement en hauteur
 */

/*
 * domLoad et onload fonctions
 * Ces fonctions permettent de lancer des fonctions en 2 temps
 * - Soit pendant le chargement de la page (mais le DOM est construit)
 * - Soit une fois que la page est construite
 */
var domLoaded = false;
var domMustLaunch = false;
var domLoadFunctionLaunched = false;
var domLoadTimer = null;
var domLoadArrFunctions = [];
var onloadArrFunctions = [];

/*
 *	domLoad() :
 *	Appartient a un ensemble de fonctions qui sont lancees pendant le chargement de la page, une fois le DOM construit
 *	Cette fonction attend que le dom soit totalement construit
 */
function domLoad(){
    if (document.getElementById("footer")) {
        domLoadCaller();
    } else {
        domLoadTimer = setTimeout("domLoad()", 10);
    }
}

domLoad();

/*
 *	domLoadCaller() :
 *	Appartient a un ensemble de fonctions qui sont lancees pendant le chargement de la page, une fois le DOM construit
 *	Cette fonction gere le lancement de la fonction finale domLoadFunctions();
 *	domLoadCaller() lances les fonctions contenues dans un array de fonctions et gere le fait que domLoad doit etre lance avant le onload
 */
function domLoadCaller(){
    domLoadFunctionLaunched = true;
    for (var i = 0; i < domLoadArrFunctions.length; i++) {
        domLoadArrFunctions[i]();
    }
    domLoadFunctions();
    domLoaded = true;
    if (domMustLaunch) {
        onloadCaller();
    }
}

/*
 *	onloadCaller() : // ne pas modifier cette fonction
 *	Cette fonction gere le lancement de la fonction finale onLoadFunctions();
 *	onLoadCaller() est executee une fois que la page est chargee.
 */
function onloadCaller(){
    clearTimeout(domLoadTimer);
    if (!domLoadFunctionLaunched) {
        domLoadCaller();
    }
    if (!domLoaded) {
        domMustLaunch = true;
        return;
    }
    for (var i = 0; i < domLoadArrFunctions.length; i++) {
        onloadArrFunctions[i]();
    }
    onloadFunctions();
}

/*
 * Executions des fonctions au chargement de la page
 */
/* domLoadFunctions() :
 *  Cette fonction est lancée pendant le chargement de la page, une fois que le DOM est completement construit
 */
function domLoadFunctions(){
    getAllBlocks(); //parsing de tous les blocks et mise ne place dans des hashmaps
    fixAligneProduits(); //alignement des contenus de produits
    getAllLists(); // parsing de toutes les listes produits ou contacts
}

/* onloadFunctions():
 *	cette fonction est lancee une fois que la page est totalement chargee (images, flash, fichiers associes)
 */
function onloadFunctions(){
    fixMiseEnAvant(); //alignement des contenus de mise en avant
    fixListeInline(); //aligne les items des listes en ligne
    fixListe2cols(); //aligne les items des listes en 2 colonnes
    fixBlocksHeight(); //alignement des blocs
    fixCorners(); //correction des coins (seulement pour IE et si besoin pour anciennes version des autres navigateurs)
    fixAddressBlock();
	
}
var fnacFlag = 0;
var fnacTimer;

function timerFix() {
	if(fnacFlag < 1) {
		fnacTimer = setTimeout(function(){
			fixBlocksHeight();
			fixAligneProduits();
			fnacFlag++;
		},4000);
	} else {
		clearTimeout(fnacTimer);
	}
}
timerFix();


/** TAKEN FROM INDEX **/
var nbBanner = 3
	,idSuivant
	,puce
	,monTimer;

function afficheBanner(idSolde, rotationSolde) {
	var divImgCible;
	puce = parseInt(idSolde.substring(12));
	idSuivant = puce + 1;
	if (idSuivant >= nbBanner) idSuivant = 0;
	var spanPuceCible = document.getElementById("puce_" + puce);
	for (var i = 0; i < nbBanner; i++) {
		var allDivs = document.getElementById("visu_banner_" + i);
		allDivs.style.display = "none";
		divImgCible = document.getElementById(idSolde);
		divImgCible.style.display = "block";
		var allPuces = document.getElementById("puce_" + i);
		allPuces.className = allPuces.className.replace(/active/, "");
		if (!/active/.test(spanPuceCible.className)) spanPuceCible.className += " active";
	}
	if (rotationSolde == "rotationOk") {
		monTimer = setTimeout("afficheBanner('visu_banner_'+idSuivant,'rotationOk')", 3500);
	}
	else {
		clearTimeout(monTimer);
		monTimer = setTimeout("afficheBanner('visu_banner_'+idSuivant,'rotationOk')", 10000);
	}
}
/** END **/


/** PLAYER CODE TAKEN FROM INDEX **/

//-------------------------------//
//	Management of the player 30s
//-------------------------------//
var StreamPlayer = null;
var NewStreamPlayer = false;
var onPlayFlag = false; //etat du player:lecture/arret
var IsOpen = false; //etat du player:fermer/ouvert
//Mise a jour de l"etat du player depuis les cookies
var temp = GetPlayerCookie("PlayerPlaying");
var lRootNid = -57;
var vnDisques = -2;
var vnFnacMusic = -70;

switch (temp) {
case '1':
	onPlayFlag = true;
	break;
case '0':
	onPlayFlag = false;
	break;
}

temp = GetPlayerCookie("Player");

switch (temp) {
case '1':
	IsOpen = true;
	break;
case '0':
	IsOpen = false;
	break;
}
//It forces the creation of the player to be able to properly update the value of cookies
if ((lRootNid == vnDisques) || (lRootNid == vnFnacMusic)) {
	if (IsOpen) StreamPlayer = getStreamPlayerWindow();
}

var ParamAddProduct = null;
var playing = false;
var typePlaying = '';

function getStreamPlayerWindow() {
	var wwwNetRootUrl = 'http://www4.fnac.com';
	try {
		NewStreamPlayer = false;
		var widthscreen = screen.Width;
		var widthplayer = 997;
		var heightscreen = screen.Height;
		var heightplayer = 520;
		var posleft = parseInt((screen.availWidth / 2) - (widthplayer / 2)) + 300;
		var postop = parseInt((screen.availHeight / 2) - (heightplayer / 2));
		var playerWindow = window.open("", "Player30sec", "menubar=no,directories=no,location=no,resizable=yes,titlebar=no,scrollbars=no,status=no,toolbar=no,height=1px,width=1px,top=" + postop + ",left=" + posleft + "");

		var wwwNetRootUrl = 'http://www4.fnac.com';
		if (playerWindow == null) {
			return null;
		}
		try {
			if (playerWindow.document.getElementById("divPlayer") == null) {
				NewStreamPlayer = true;
				playerWindow.location.href = wwwNetRootUrl + "/shelf/common/content/Player30s.aspx";
			}
		}
		catch (e) {
			NewStreamPlayer = true;
			playerWindow.location.href = wwwNetRootUrl + "/shelf/common/content/Player30s.aspx";
		}

		return playerWindow;
	}
	catch (e) {
		return null;
	}
}

function AddProductPointer() {
	if (ParamAddProduct && StreamPlayer) {
		StreamPlayer.AddProduct(ParamAddProduct, playing);
		ParamAddProduct = null;
	}
}

function AddProduct(id, type) {
	playing = false;
	typePlaying = type;
	StreamPlayer = getStreamPlayerWindow();

	if (StreamPlayer != null && id != null && id != '') {
		ParamAddProduct = id;
		if (NewStreamPlayer) {
			//new popup
			playing = true;
			setTimeout(AddProductPointer, 3000);
		}
		else {
			AddProductPointer();
		}
	}
	var isChrome = /chrome/.test(navigator.userAgent.toLowerCase());
	if (isChrome) {
		StreamPlayer.blur();
	}
	StreamPlayer.focus();
}

//Play / Stop button can manage the exclusive read between the reader and the reader 30s heart page
function DoPlay(flag) {
	try {
		if (StreamPlayer) {
			StreamPlayer.DoPlay(flag);
		} else {
			//If the reader has been opened in a previous page
			if (IsOpen) {
				StreamPlayer = getStreamPlayerWindow();
				if (StreamPlayer) {
					StreamPlayer.DoPlay(flag);
				}
			}
		}
	}
	catch (e) {}
}

//return on the state of the player
function Onplay(flag) {
	// It saves the state of the player 30s
	onPlayFlag = flag;
	//If the player has passed the state reading it stops the heart player page
	if (onPlayFlag == true) {
		try {
			MultiAudioPlayer.stopCurrentPlayer();
		}
		catch (e) {}
	}
}
//Back when adding to the player

function OnItemAdded(ids) {

}

function PlayThisMedia(eventArgs, who) {
	Onplay();
}
//----//
//	Navigation management
//----//
//Transition to another page it saves the state of the player in cookies
window.onbeforeunload = updatePlayerCookies;
//----//
//	Manage Cookies
//----//

//Reading Cookies
function GetPlayerCookie(name) {
	var arg = name + "=";
	var alen = arg.length;
	var clen = document.cookie.length;
	var i = 0;
	while (i < clen) {
		var j = i + alen;
		if (document.cookie.substring(i, j) == arg) return getPlayerCookieVal(j);
		i = document.cookie.indexOf(" ", i) + 1;
		if (i == 0) break;
	}
	return -1;
}

function getPlayerCookieVal(offset) {
	var endstr = document.cookie.indexOf(";", offset);
	if (endstr == -1) endstr = document.cookie.length;
	return unescape(document.cookie.substring(offset, endstr));
}

//Update cookies
function updatePlayerCookies() {
	var Player = GetPlayerCookie("Player");
	var PlayerPlaying = GetPlayerCookie("PlayerPlaying");
	//Player is open
	if (StreamPlayer) {
		if (StreamPlayer.closed == false) SetPlayerCookie("Player", 1, 0);
		else SetPlayerCookie("Player", 0, 0);
		//Player for reading: No such flag is not used for now but it may be helpful:)
		if (onPlayFlag) SetPlayerCookie("PlayerPlaying", 1, 0);
		else SetPlayerCookie("PlayerPlaying", 0, 0);
	} else {
		if (Player <= 0) SetPlayerCookie("Player", 0, 0);
		else SetPlayerCookie("Player", 1, 0);
		if (PlayerPlaying <= 0) SetPlayerCookie("PlayerPlaying", 0, 0);
		else SetPlayerCookie("PlayerPlaying", 1, 0);
	}
}

function SetPlayerCookie(name, value, expires) {
	var domain = document.domain;
	var path = '/';
	var expDate = new Date();
	expDate.setTime(expDate.getTime() + (expires * 24 * 3600 * 1000));
	((path) ? "; path=" + path : "") + ((domain) ? "; domain=" + domain : "");
}
/** END **/


//on lance la fonction onloadCaller une fois la page chargee.
$(function(){
    onloadCaller();

	//ce script va sauter avec la sortie du moteur de recherche v3
	function ChangeContext() {
		var context =  $("#ebook").val();
		var val = $("#SCat").val();
		if(val == "ebook") {
			$("#SCat").val("book");
		} else {
			$("#ebook").val("false");
		}
	}
	$("#submitbtn").click(ChangeContext);
	$("#Fnac_Search").keypress(function(e) {
		if (e.keyCode == 13) {
			ChangeContext();
		}
	});
	
	$("#cartouche").click(function() {
		$('#detailPanier').slideToggle(500);
		return false;
	});
	
	$("#SCat").change( function() {
		$("#Fnac_Search").flushCache();
		var ComboVal = $("#SCat").val();
		if(ComboVal == "ebook") {
			$("#ebook").val("true");	
		}
	});

	$("#Fnac_Search").autocomplete("http://autocompletion.fnac.com/search-autocomplete/autocomplete?method=GetCommonSuggest", {
		width: 260,
		selectFirst: false,
		max: 10,
		scrollHeight: 200,
		cacheLength: 0,
		delay: 150,
		dataType: "jsonp",
		highlight: function(value, term) {
			return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + ")(?![^<>]*>)(?![^&;]+;)", "i"), "<strong>$1</strong>");
		},
		extraParams: {
			"text":function() { return $("#Fnac_Search").val(); },
			"category": function() { 
				var rex = new RegExp("!1$");
				var cat = $("#SCat").val().replace(rex,'');
				return cat;
			},
			"encoding": "UTF-8"
		},
		parse: function(data) {
			return $.map(data, function(row) {
				return {
					data: row,
					value: row.sentence,
					result: row.sentence
				}
			});
		},
		formatItem: function(itemResult) {
			return itemResult.sentence;
		}
	});

	$("#Fnac_Search").result(function(event, data, formatted) {
		if (data)
			$("#QuickSearchForm").submit();
	});
	// fin script autocompletion

	// au passage de la souris sur le lien de l'onglet
	$("#onglets li a").mouseenter(function(){
		//on affiche son megaMenu
		$(this).siblings(".megaMenu").css("display","block");
	}).mouseleave(function(){
		//on cache son megaMenu
		$(this).siblings(".megaMenu").css("display","none");
	});
	//tant que la souris se trouve sur le megaMenu
	$(".megaMenu").mouseenter(function(){
		// il reste affiché
		$(this).css("display","block");
		// et on applique la classe .hover a son lien
		$(this).siblings("a.ongLink").addClass("hover");
	}).mouseleave(function(){
		// il se cache
		$(this).css("display","none");
		// et on retire la classe .hover a son lien
		$(this).siblings("a.ongLink").removeClass("hover");
	});
	// et On empêche le navigateur de suivre le lien
	//return false;
	
	for (var x = 0; x < nbBanner; x++) {
		$("#puce_" + x).click(function (e) {
			e.preventDefault();
			var index = $(e.target).attr("id");
			index = index.substring(5);
			clearTimeout(monTimer);
			afficheBanner('visu_banner_' + index, 'rotationOk');
		});
	}
	
	afficheBanner("visu_banner_0", "rotationOk");
	
	// Replace inline JSON loader calls with this
	$(".MarketPlaceOffers").each(function() {
		var p = this.id.substring(3);
		
		$.getJSON("http://www4.fnac.com/MarketPlace/SummaryOfferLine.aspx?PRID=" + p + "&Ref=FnacDirect&tagmode=any&format=json&jsoncallback=?", function(d) {
			$("#mpo" + p).html(d.MarketPlaceSummary);
		});
	});
});