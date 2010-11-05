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