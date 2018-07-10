/**
 * jQuery Form Validator
 * ------------------------------------------
 * Created by Victor Jonsson <http://www.victorjonsson.se>
 *
 * @website http://formvalidator.net/
 * @license Dual licensed under the MIT or GPL Version 2 licenses
 * @version 2.2.63
 */
(function($){"use strict";var $window=$(window),_getInputParentContainer=function($elem){if($elem.valAttr("error-msg-container")){return $($elem.valAttr("error-msg-container"))}else{var $parent=$elem.parent();if(!$parent.hasClass("form-group")&&!$parent.closest("form").hasClass("form-horizontal")){var $formGroup=$parent.closest(".form-group");if($formGroup.length){return $formGroup.eq(0)}}return $parent}},_applyErrorStyle=function($elem,conf){$elem.addClass(conf.errorElementClass).removeClass("valid");_getInputParentContainer($elem).addClass(conf.inputParentClassOnError).removeClass(conf.inputParentClassOnSuccess);if(conf.borderColorOnError!==""){$elem.css("border-color",conf.borderColorOnError)}},_removeErrorStyle=function($elem,conf){$elem.each(function(){var $this=$(this);_setInlineErrorMessage($this,"",conf,conf.errorMessagePosition);$this.removeClass("valid").removeClass(conf.errorElementClass).css("border-color","");_getInputParentContainer($this).removeClass(conf.inputParentClassOnError).removeClass(conf.inputParentClassOnSuccess).find("."+conf.errorMessageClass).remove()})},_setInlineErrorMessage=function($input,mess,conf,$messageContainer){var custom=document.getElementById($input.attr("name")+"_err_msg"),setErrorMessage=function($elem){$window.trigger("validationErrorDisplay",[$input,$elem]);$elem.html(mess)};if(custom){setErrorMessage($(custom))}else if(typeof $messageContainer=="object"){var $found=false;$messageContainer.find("."+conf.errorMessageClass).each(function(){if(this.inputReferer==$input[0]){$found=$(this);return false}});if($found){if(!mess){$found.remove()}else{setErrorMessage($found)}}else{var $mess=$('<div class="'+conf.errorMessageClass+'"></div>');setErrorMessage($mess);$mess[0].inputReferer=$input[0];$messageContainer.prepend($mess)}}else{var $parent=_getInputParentContainer($input),$mess=$parent.find("."+conf.errorMessageClass+".help-block");if($mess.length==0){$mess=$("<span></span>").addClass("help-block").addClass(conf.errorMessageClass);$mess.appendTo($parent)}setErrorMessage($mess)}},_templateMessage=function($form,title,errorMessages,conf){var messages=conf.errorMessageTemplate.messages.replace(/\{errorTitle\}/g,title),fields=[],container;$.each(errorMessages,function(i,msg){fields.push(conf.errorMessageTemplate.field.replace(/\{msg\}/g,msg))});messages=messages.replace(/\{fields\}/g,fields.join(""));container=conf.errorMessageTemplate.container.replace(/\{errorMessageClass\}/g,conf.errorMessageClass);container=container.replace(/\{messages\}/g,messages);$form.children().eq(0).before(container)};$.fn.validateOnBlur=function(language,conf){this.find("*[data-validation]").bind("blur.validation",function(){$(this).validateInputOnBlur(language,conf,true,"blur")});if(conf.validateCheckboxRadioOnClick){this.find("input[type=checkbox][data-validation],input[type=radio][data-validation]").bind("click.validation",function(){$(this).validateInputOnBlur(language,conf,true,"click")})}return this};$.fn.validateOnEvent=function(language,settings){this.find("*[data-validation-event]").each(function(){var $el=$(this),etype=$el.valAttr("event");if(etype){$el.unbind(etype+".validation").bind(etype+".validation",function(){$(this).validateInputOnBlur(language,settings,true,etype)})}});return this};$.fn.showHelpOnFocus=function(attrName){if(!attrName){attrName="data-validation-help"}this.find(".has-help-txt").valAttr("has-keyup-event",false).removeClass("has-help-txt");this.find("textarea,input").each(function(){var $elem=$(this),className="jquery_form_help_"+($elem.attr("name")||"").replace(/(:|\.|\[|\])/g,""),help=$elem.attr(attrName);if(help){$elem.addClass("has-help-txt").unbind("focus.help").bind("focus.help",function(){var $help=$elem.parent().find("."+className);if($help.length==0){$help=$("<span />").addClass(className).addClass("help").addClass("help-block").text(help).hide();$elem.after($help)}$help.fadeIn()}).unbind("blur.help").bind("blur.help",function(){$(this).parent().find("."+className).fadeOut("slow")})}});return this};$.fn.validate=function(cb,conf,lang){var language=$.extend({},$.formUtils.LANG,lang||{});this.each(function(){var $elem=$(this);$elem.one("validation",function(evt,isValid){if(typeof cb=="function")cb(isValid,this,evt)});$elem.validateInputOnBlur(language,$.extend({},$elem.closest("form").get(0).validationConfig,conf||{}),true)})};$.fn.willPostponeValidation=function(){return(this.valAttr("suggestion-nr")||this.valAttr("postpone")||this.hasClass("hasDatepicker"))&&!window.postponedValidation};$.fn.validateInputOnBlur=function(language,conf,attachKeyupEvent,eventType){$.formUtils.eventType=eventType;if(this.willPostponeValidation()){var _self=this,postponeTime=this.valAttr("postpone")||200;window.postponedValidation=function(){_self.validateInputOnBlur(language,conf,attachKeyupEvent,eventType);window.postponedValidation=false};setTimeout(function(){if(window.postponedValidation){window.postponedValidation()}},postponeTime);return this}language=$.extend({},$.formUtils.LANG,language||{});_removeErrorStyle(this,conf);var $elem=this,$form=$elem.closest("form"),validationRule=$elem.attr(conf.validationRuleAttribute),result=$.formUtils.validateInput($elem,language,conf,$form,eventType);if(result.isValid){if(result.shouldChangeDisplay){$elem.addClass("valid");_getInputParentContainer($elem).addClass(conf.inputParentClassOnSuccess)}}else if(!result.isValid){_applyErrorStyle($elem,conf);_setInlineErrorMessage($elem,result.errorMsg,conf,conf.errorMessagePosition);if(attachKeyupEvent){$elem.unbind("keyup.validation").bind("keyup.validation",function(){$(this).validateInputOnBlur(language,conf,false,"keyup")})}}return this};$.fn.valAttr=function(name,val){if(val===undefined){return this.attr("data-validation-"+name)}else if(val===false||val===null){return this.removeAttr("data-validation-"+name)}else{if(name.length>0)name="-"+name;return this.attr("data-validation"+name,val)}};$.fn.isValid=function(language,conf,displayError){if($.formUtils.isLoadingModules){var $self=this;setTimeout(function(){$self.isValid(language,conf,displayError)},200);return null}conf=$.extend({},$.formUtils.defaultConfig(),conf||{});language=$.extend({},$.formUtils.LANG,language||{});displayError=displayError!==false;if($.formUtils.errorDisplayPreventedWhenHalted){delete $.formUtils.errorDisplayPreventedWhenHalted;displayError=false}$.formUtils.isValidatingEntireForm=true;$.formUtils.haltValidation=false;var addErrorMessage=function(mess,$elem){if($.inArray(mess,errorMessages)<0){errorMessages.push(mess)}errorInputs.push($elem);$elem.attr("current-error",mess);if(displayError)_applyErrorStyle($elem,conf)},checkedInputs=[],errorMessages=[],errorInputs=[],$form=this,ignoreInput=function(name,type){if(type==="submit"||type==="button"||type=="reset"){return true}return $.inArray(name,conf.ignore||[])>-1};if(displayError){$form.find("."+conf.errorMessageClass+".alert").remove();_removeErrorStyle($form.find("."+conf.errorElementClass+",.valid"),conf)}$form.find("input,textarea,select").filter(':not([type="submit"],[type="button"])').each(function(){var $elem=$(this),elementType=$elem.attr("type"),isCheckboxOrRadioBtn=elementType=="radio"||elementType=="checkbox",elementName=$elem.attr("name");if(!ignoreInput(elementName,elementType)&&(!isCheckboxOrRadioBtn||$.inArray(elementName,checkedInputs)<0)){if(isCheckboxOrRadioBtn)checkedInputs.push(elementName);var result=$.formUtils.validateInput($elem,language,conf,$form,"submit");if(result.shouldChangeDisplay){if(!result.isValid){addErrorMessage(result.errorMsg,$elem)}else if(result.isValid){$elem.valAttr("current-error",false).addClass("valid");_getInputParentContainer($elem).addClass(conf.inputParentClassOnSuccess)}}}});if(typeof conf.onValidate=="function"){var errors=conf.onValidate($form);if($.isArray(errors)){$.each(errors,function(i,err){addErrorMessage(err.message,err.element)})}else if(errors&&errors.element&&errors.message){addErrorMessage(errors.message,errors.element)}}$.formUtils.isValidatingEntireForm=false;if(!$.formUtils.haltValidation&&errorInputs.length>0){if(displayError){if(conf.errorMessagePosition==="top"){_templateMessage($form,language.errorTitle,errorMessages,conf)}else if(conf.errorMessagePosition==="custom"){if(typeof conf.errorMessageCustom==="function"){conf.errorMessageCustom($form,language.errorTitle,errorMessages,conf)}}else{$.each(errorInputs,function(i,$input){_setInlineErrorMessage($input,$input.attr("current-error"),conf,conf.errorMessagePosition)})}if(conf.scrollToTopOnError){$window.scrollTop($form.offset().top-20)}}return false}if(!displayError&&$.formUtils.haltValidation){$.formUtils.errorDisplayPreventedWhenHalted=true}return!$.formUtils.haltValidation};$.fn.validateForm=function(language,conf){if(window.console&&typeof window.console.warn=="function"){window.console.warn("Use of deprecated function $.validateForm, use $.isValid instead")}return this.isValid(language,conf,true)};$.fn.restrictLength=function(maxLengthElement){new $.formUtils.lengthRestriction(this,maxLengthElement);return this};$.fn.addSuggestions=function(settings){var sugs=false;this.find("input").each(function(){var $field=$(this);sugs=$.split($field.attr("data-suggestions"));if(sugs.length>0&&!$field.hasClass("has-suggestions")){$.formUtils.suggest($field,sugs,settings);$field.addClass("has-suggestions")}});return this};$.split=function(val,callback){if(typeof callback!="function"){if(!val)return[];var values=[];$.each(val.split(callback?callback:/[,|\-\s]\s*/g),function(i,str){str=$.trim(str);if(str.length)values.push(str)});return values}else if(val){$.each(val.split(/[,|\-\s]\s*/g),function(i,str){str=$.trim(str);if(str.length)return callback(str,i)})}};$.validate=function(conf){var defaultConf=$.extend($.formUtils.defaultConfig(),{form:"form",validateOnEvent:false,validateOnBlur:true,validateCheckboxRadioOnClick:true,showHelpOnFocus:true,addSuggestions:true,modules:"",onModulesLoaded:null,language:false,onSuccess:false,onError:false,onElementValidate:false});conf=$.extend(defaultConf,conf||{});if(conf.lang&&conf.lang!="en"){var langModule="lang/"+conf.lang+".js";conf.modules+=conf.modules.length?","+langModule:langModule}$(conf.form).each(function(i,form){form.validationConfig=conf;var $form=$(form);$window.trigger("formValidationSetup",[$form,conf]);$form.find(".has-help-txt").unbind("focus.validation").unbind("blur.validation");$form.removeClass("has-validation-callback").unbind("submit.validation").unbind("reset.validation").find("input[data-validation],textarea[data-validation]").unbind("blur.validation");$form.bind("submit.validation",function(){var $form=$(this);if($.formUtils.haltValidation){return false}if($.formUtils.isLoadingModules){setTimeout(function(){$form.trigger("submit.validation")},200);return false}var valid=$form.isValid(conf.language,conf);if($.formUtils.haltValidation){return false}else{if(valid&&typeof conf.onSuccess=="function"){var callbackResponse=conf.onSuccess($form);if(callbackResponse===false){return false}}else if(!valid&&typeof conf.onError=="function"){conf.onError($form);return false}else{return valid}}}).bind("reset.validation",function(){$(this).find("."+conf.errorMessageClass+".alert").remove();_removeErrorStyle($(this).find("."+conf.errorElementClass+",.valid"),conf)}).addClass("has-validation-callback");if(conf.showHelpOnFocus){$form.showHelpOnFocus()}if(conf.addSuggestions){$form.addSuggestions()}if(conf.validateOnBlur){$form.validateOnBlur(conf.language,conf);$form.bind("html5ValidationAttrsFound",function(){$form.validateOnBlur(conf.language,conf)})}if(conf.validateOnEvent){$form.validateOnEvent(conf.language,conf)}});if(conf.modules!=""){$.formUtils.loadModules(conf.modules,false,function(){if(typeof conf.onModulesLoaded=="function"){conf.onModulesLoaded()}$window.trigger("validatorsLoaded",[typeof conf.form=="string"?$(conf.form):conf.form,conf])})}};$.formUtils={defaultConfig:function(){return{ignore:[],errorElementClass:"error",borderColorOnError:"#b94a48",errorMessageClass:"form-error",validationRuleAttribute:"data-validation",validationErrorMsgAttribute:"data-validation-error-msg",errorMessagePosition:"element",errorMessageTemplate:{container:'<div class="{errorMessageClass} alert alert-danger">{messages}</div>',messages:"<strong>{errorTitle}</strong><ul>{fields}</ul>",field:"<li>{msg}</li>"},errorMessageCustom:_templateMessage,scrollToTopOnError:true,dateFormat:"yyyy-mm-dd",addValidClassOnAll:false,decimalSeparator:".",inputParentClassOnError:"has-error",inputParentClassOnSuccess:"has-success"}},validators:{},_events:{load:[],valid:[],invalid:[]},haltValidation:false,isValidatingEntireForm:false,addValidator:function(validator){var name=validator.name.indexOf("validate_")===0?validator.name:"validate_"+validator.name;if(validator.validateOnKeyUp===undefined)validator.validateOnKeyUp=true;this.validators[name]=validator},isLoadingModules:false,loadedModules:{},loadModules:function(modules,path,fireEvent){if(fireEvent===undefined)fireEvent=true;if($.formUtils.isLoadingModules){setTimeout(function(){$.formUtils.loadModules(modules,path,fireEvent)});return}var hasLoadedAnyModule=false,loadModuleScripts=function(modules,path){var moduleList=$.split(modules),numModules=moduleList.length,moduleLoadedCallback=function(){numModules--;if(numModules==0){$.formUtils.isLoadingModules=false;if(fireEvent&&hasLoadedAnyModule){if(typeof fireEvent=="function"){fireEvent()}else{$window.trigger("validatorsLoaded")}}}};if(numModules>0){$.formUtils.isLoadingModules=true}var cacheSuffix="?_="+(new Date).getTime(),appendToElement=document.getElementsByTagName("head")[0]||document.getElementsByTagName("body")[0];$.each(moduleList,function(i,modName){modName=$.trim(modName);if(modName.length==0){moduleLoadedCallback()}else{var scriptUrl=path+modName+(modName.slice(-3)==".js"?"":".js"),script=document.createElement("SCRIPT");if(scriptUrl in $.formUtils.loadedModules){moduleLoadedCallback()}else{$.formUtils.loadedModules[scriptUrl]=1;hasLoadedAnyModule=true;script.type="text/javascript";script.onload=moduleLoadedCallback;script.src=scriptUrl+(scriptUrl.slice(-7)==".dev.js"?cacheSuffix:"");script.onerror=function(){if("console"in window&&window.console.log){window.console.log("Unable to load form validation module "+scriptUrl)}};script.onreadystatechange=function(){if(this.readyState=="complete"||this.readyState=="loaded"){moduleLoadedCallback();this.onload=null;this.onreadystatechange=null}};appendToElement.appendChild(script)}}})};if(path){loadModuleScripts(modules,path)}else{var findScriptPathAndLoadModules=function(){var foundPath=false;$('script[src*="form-validator"]').each(function(){foundPath=this.src.substr(0,this.src.lastIndexOf("/"))+"/";if(foundPath=="/")foundPath="";return false});if(foundPath!==false){loadModuleScripts(modules,foundPath);return true}return false};if(!findScriptPathAndLoadModules()){$(findScriptPathAndLoadModules)}}},validateInput:function($elem,language,conf,$form,eventContext){$elem.trigger("beforeValidation");conf=conf||$.formUtils.defaultConfig();language=language||$.formUtils.LANG;var value=$elem.val()||"",result={isValid:true,shouldChangeDisplay:true,errorMsg:""},optional=$elem.valAttr("optional"),validationDependsOnCheckedInput=false,validationDependentInputIsChecked=false,validateIfCheckedElement=false,validateIfCheckedElementName=$elem.valAttr("if-checked");if($elem.attr("disabled")||!$elem.is(":visible")){result.shouldChangeDisplay=false;return result}if(validateIfCheckedElementName!=null){validationDependsOnCheckedInput=true;validateIfCheckedElement=$form.find('input[name="'+validateIfCheckedElementName+'"]');if(validateIfCheckedElement.prop("checked")){validationDependentInputIsChecked=true}}var isInvalidNumberInput=!value&&$elem[0].type=="number";if(!value&&optional==="true"&&!isInvalidNumberInput||validationDependsOnCheckedInput&&!validationDependentInputIsChecked){result.shouldChangeDisplay=conf.addValidClassOnAll;return result}var validationRules=$elem.attr(conf.validationRuleAttribute),validationErrorMsg=true;if(!validationRules){result.shouldChangeDisplay=conf.addValidClassOnAll;return result}$.split(validationRules,function(rule){if(rule.indexOf("validate_")!==0){rule="validate_"+rule}var validator=$.formUtils.validators[rule];if(validator&&typeof validator["validatorFunction"]=="function"){if(rule=="validate_checkbox_group"){$elem=$form.find("[name='"+$elem.attr("name")+"']:eq(0)")}var isValid=null;if(eventContext!="keyup"||validator.validateOnKeyUp){isValid=validator.validatorFunction(value,$elem,conf,language,$form)}if(!isValid){validationErrorMsg=null;if(isValid!==null){validationErrorMsg=$elem.attr(conf.validationErrorMsgAttribute+"-"+rule.replace("validate_",""));if(!validationErrorMsg){validationErrorMsg=$elem.attr(conf.validationErrorMsgAttribute);if(!validationErrorMsg){validationErrorMsg=language[validator.errorMessageKey];if(!validationErrorMsg)validationErrorMsg=validator.errorMessage}}}return false}}else{throw new Error('Using undefined validator "'+rule+'"')}}," ");if(typeof validationErrorMsg=="string"){$elem.trigger("validation",false);result.errorMsg=validationErrorMsg;result.isValid=false;result.shouldChangeDisplay=true}else if(validationErrorMsg===null){result.shouldChangeDisplay=conf.addValidClassOnAll}else{$elem.trigger("validation",true);result.shouldChangeDisplay=true}if(typeof conf.onElementValidate=="function"&&result!==null){conf.onElementValidate(result.isValid,$elem,$form,validationErrorMsg)}return result},parseDate:function(val,dateFormat){var divider=dateFormat.replace(/[a-zA-Z]/gi,"").substring(0,1),regexp="^",formatParts=dateFormat.split(divider||null),matches,day,month,year;$.each(formatParts,function(i,part){regexp+=(i>0?"\\"+divider:"")+"(\\d{"+part.length+"})"});regexp+="$";matches=val.match(new RegExp(regexp));if(matches===null){return false}var findDateUnit=function(unit,formatParts,matches){for(var i=0;i<formatParts.length;i++){if(formatParts[i].substring(0,1)===unit){return $.formUtils.parseDateInt(matches[i+1])}}return-1};month=findDateUnit("m",formatParts,matches);day=findDateUnit("d",formatParts,matches);year=findDateUnit("y",formatParts,matches);if(month===2&&day>28&&(year%4!==0||year%100===0&&year%400!==0)||month===2&&day>29&&(year%4===0||year%100!==0&&year%400===0)||month>12||month===0){return false}if(this.isShortMonth(month)&&day>30||!this.isShortMonth(month)&&day>31||day===0){return false}return[year,month,day]},parseDateInt:function(val){if(val.indexOf("0")===0){val=val.replace("0","")}return parseInt(val,10)},isShortMonth:function(m){return m%2===0&&m<7||m%2!==0&&m>7},lengthRestriction:function($inputElement,$maxLengthElement){var maxChars=parseInt($maxLengthElement.text(),10),charsLeft=0,countCharacters=function(){var numChars=$inputElement.val().length;if(numChars>maxChars){var currScrollTopPos=$inputElement.scrollTop();$inputElement.val($inputElement.val().substring(0,maxChars));$inputElement.scrollTop(currScrollTopPos)}charsLeft=maxChars-numChars;if(charsLeft<0)charsLeft=0;$maxLengthElement.text(charsLeft)};$($inputElement).bind("keydown keyup keypress focus blur",countCharacters).bind("cut paste",function(){setTimeout(countCharacters,100)});$(document).bind("ready",countCharacters)},numericRangeCheck:function(value,rangeAllowed){var range=$.split(rangeAllowed),minmax=parseInt(rangeAllowed.substr(3),10);if(range.length==1&&rangeAllowed.indexOf("min")==-1&&rangeAllowed.indexOf("max")==-1){range=[rangeAllowed,rangeAllowed]}if(range.length==2&&(value<parseInt(range[0],10)||value>parseInt(range[1],10))){return["out",range[0],range[1]]}else if(rangeAllowed.indexOf("min")===0&&value<minmax){return["min",minmax]}else if(rangeAllowed.indexOf("max")===0&&value>minmax){return["max",minmax]}return["ok"]},_numSuggestionElements:0,_selectedSuggestion:null,_previousTypedVal:null,suggest:function($elem,suggestions,settings){var conf={css:{maxHeight:"150px",background:"#FFF",lineHeight:"150%",textDecoration:"underline",overflowX:"hidden",overflowY:"auto",border:"#CCC solid 1px",borderTop:"none",cursor:"pointer"},activeSuggestionCSS:{background:"#E9E9E9"}},setSuggsetionPosition=function($suggestionContainer,$input){var offset=$input.offset();$suggestionContainer.css({width:$input.outerWidth(),left:offset.left+"px",top:offset.top+$input.outerHeight()+"px"})};if(settings)$.extend(conf,settings);conf.css["position"]="absolute";conf.css["z-index"]=9999;$elem.attr("autocomplete","off");if(this._numSuggestionElements===0){$window.bind("resize",function(){$(".jquery-form-suggestions").each(function(){var $container=$(this),suggestID=$container.attr("data-suggest-container");setSuggsetionPosition($container,$(".suggestions-"+suggestID).eq(0))})})}this._numSuggestionElements++;var onSelectSuggestion=function($el){var suggestionId=$el.valAttr("suggestion-nr");$.formUtils._selectedSuggestion=null;$.formUtils._previousTypedVal=null;$(".jquery-form-suggestion-"+suggestionId).fadeOut("fast")};$elem.data("suggestions",suggestions).valAttr("suggestion-nr",this._numSuggestionElements).unbind("focus.suggest").bind("focus.suggest",function(){$(this).trigger("keyup");$.formUtils._selectedSuggestion=null}).unbind("keyup.suggest").bind("keyup.suggest",function(){var $input=$(this),foundSuggestions=[],val=$.trim($input.val()).toLocaleLowerCase();if(val==$.formUtils._previousTypedVal){return}else{$.formUtils._previousTypedVal=val}var hasTypedSuggestion=false,suggestionId=$input.valAttr("suggestion-nr"),$suggestionContainer=$(".jquery-form-suggestion-"+suggestionId);$suggestionContainer.scrollTop(0);if(val!=""){var findPartial=val.length>2;$.each($input.data("suggestions"),function(i,suggestion){var lowerCaseVal=suggestion.toLocaleLowerCase();if(lowerCaseVal==val){foundSuggestions.push("<strong>"+suggestion+"</strong>");hasTypedSuggestion=true;return false}else if(lowerCaseVal.indexOf(val)===0||findPartial&&lowerCaseVal.indexOf(val)>-1){foundSuggestions.push(suggestion.replace(new RegExp(val,"gi"),"<strong>$&</strong>"))}})}if(hasTypedSuggestion||foundSuggestions.length==0&&$suggestionContainer.length>0){$suggestionContainer.hide()}else if(foundSuggestions.length>0&&$suggestionContainer.length==0){$suggestionContainer=$("<div></div>").css(conf.css).appendTo("body");$elem.addClass("suggestions-"+suggestionId);$suggestionContainer.attr("data-suggest-container",suggestionId).addClass("jquery-form-suggestions").addClass("jquery-form-suggestion-"+suggestionId)}else if(foundSuggestions.length>0&&!$suggestionContainer.is(":visible")){$suggestionContainer.show()}if(foundSuggestions.length>0&&val.length!=foundSuggestions[0].length){setSuggsetionPosition($suggestionContainer,$input);$suggestionContainer.html("");$.each(foundSuggestions,function(i,text){$("<div></div>").append(text).css({overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",padding:"5px"}).addClass("form-suggest-element").appendTo($suggestionContainer).click(function(){$input.focus();$input.val($(this).text());onSelectSuggestion($input)})})}}).unbind("keydown.validation").bind("keydown.validation",function(e){var code=e.keyCode?e.keyCode:e.which,suggestionId,$suggestionContainer,$input=$(this);if(code==13&&$.formUtils._selectedSuggestion!==null){suggestionId=$input.valAttr("suggestion-nr");$suggestionContainer=$(".jquery-form-suggestion-"+suggestionId);if($suggestionContainer.length>0){var newText=$suggestionContainer.find("div").eq($.formUtils._selectedSuggestion).text();$input.val(newText);onSelectSuggestion($input);e.preventDefault()}}else{suggestionId=$input.valAttr("suggestion-nr");$suggestionContainer=$(".jquery-form-suggestion-"+suggestionId);var $suggestions=$suggestionContainer.children();if($suggestions.length>0&&$.inArray(code,[38,40])>-1){if(code==38){if($.formUtils._selectedSuggestion===null)$.formUtils._selectedSuggestion=$suggestions.length-1;else $.formUtils._selectedSuggestion--;if($.formUtils._selectedSuggestion<0)$.formUtils._selectedSuggestion=$suggestions.length-1}else if(code==40){if($.formUtils._selectedSuggestion===null)$.formUtils._selectedSuggestion=0;else $.formUtils._selectedSuggestion++;if($.formUtils._selectedSuggestion>$suggestions.length-1)$.formUtils._selectedSuggestion=0}var containerInnerHeight=$suggestionContainer.innerHeight(),containerScrollTop=$suggestionContainer.scrollTop(),suggestionHeight=$suggestionContainer.children().eq(0).outerHeight(),activeSuggestionPosY=suggestionHeight*$.formUtils._selectedSuggestion;if(activeSuggestionPosY<containerScrollTop||activeSuggestionPosY>containerScrollTop+containerInnerHeight){$suggestionContainer.scrollTop(activeSuggestionPosY)}$suggestions.removeClass("active-suggestion").css("background","none").eq($.formUtils._selectedSuggestion).addClass("active-suggestion").css(conf.activeSuggestionCSS);e.preventDefault();return false}}}).unbind("blur.suggest").bind("blur.suggest",function(){onSelectSuggestion($(this))});return $elem},LANG:{errorTitle:"Form submission failed!",requiredFields:"You have not answered all required fields",badTime:"You have not given a correct time",badEmail:"You have not given a correct e-mail address",badTelephone:"You have not given a correct phone number",badSecurityAnswer:"You have not given a correct answer to the security question",badDate:"You have not given a correct date",lengthBadStart:"The input value must be between ",lengthBadEnd:" characters",lengthTooLongStart:"The input value is longer than ",lengthTooShortStart:"The input value is shorter than ",notConfirmed:"Input values could not be confirmed",badDomain:"Incorrect domain value",badUrl:"The input value is not a correct URL",badCustomVal:"The input value is incorrect",andSpaces:" and spaces ",badInt:"The input value was not a correct number",badSecurityNumber:"Your social security number was incorrect",badUKVatAnswer:"Incorrect UK VAT Number",badStrength:"The password isn't strong enough",badNumberOfSelectedOptionsStart:"You have to choose at least ",badNumberOfSelectedOptionsEnd:" answers",badAlphaNumeric:"The input value can only contain alphanumeric characters ",badAlphaNumericExtra:" and ",wrongFileSize:"The file you are trying to upload is too large (max %s)",wrongFileType:"Only files of type %s is allowed",groupCheckedRangeStart:"Please choose between ",groupCheckedTooFewStart:"Please choose at least ",groupCheckedTooManyStart:"Please choose a maximum of ",groupCheckedEnd:" item(s)",badCreditCard:"The credit card number is not correct",badCVV:"The CVV number was not correct",wrongFileDim:"Incorrect image dimensions,",imageTooTall:"the image can not be taller than",imageTooWide:"the image can not be wider than",imageTooSmall:"the image was too small",min:"min",max:"max",imageRatioNotAccepted:"Image ratio is not be accepted",badBrazilTelephoneAnswer:"The phone number entered is invalid",badBrazilCEPAnswer:"The CEP entered is invalid",badBrazilCPFAnswer:"The CPF entered is invalid"}};$.formUtils.addValidator({name:"email",validatorFunction:function(email){var emailParts=email.toLowerCase().split("@"),localPart=emailParts[0],domain=emailParts[1];if(localPart&&domain){if(localPart.indexOf('"')==0){var len=localPart.length;localPart=localPart.replace(/\"/g,"");if(localPart.length!=len-2){return false}}return $.formUtils.validators.validate_domain.validatorFunction(emailParts[1])&&localPart.indexOf(".")!=0&&localPart.substring(localPart.length-1,localPart.length)!="."&&localPart.indexOf("..")==-1&&!/[^\w\+\.\-\#\-\_\~\!\$\&\'\(\)\*\+\,\;\=\:]/.test(localPart)}return false},errorMessage:"",errorMessageKey:"badEmail"});$.formUtils.addValidator({name:"domain",validatorFunction:function(val){return val.length>0&&val.length<=253&&!/[^a-zA-Z0-9]/.test(val.slice(-2))&&!/[^a-zA-Z0-9]/.test(val.substr(0,1))&&!/[^a-zA-Z0-9\.\-]/.test(val)&&val.split("..").length==1&&val.split(".").length>1},errorMessage:"",errorMessageKey:"badDomain"});$.formUtils.addValidator({name:"required",validatorFunction:function(val,$el,config,language,$form){switch($el.attr("type")){case"checkbox":return $el.is(":checked");case"radio":return $form.find('input[name="'+$el.attr("name")+'"]').filter(":checked").length>0;default:return $.trim(val)!==""}},errorMessage:"",errorMessageKey:"requiredFields"});$.formUtils.addValidator({name:"length",validatorFunction:function(val,$el,conf,lang){var lengthAllowed=$el.valAttr("length"),type=$el.attr("type");if(lengthAllowed==undefined){alert('Please add attribute "data-validation-length" to '+$el[0].nodeName+" named "+$el.attr("name"));return true}var len=type=="file"&&$el.get(0).files!==undefined?$el.get(0).files.length:val.length,lengthCheckResults=$.formUtils.numericRangeCheck(len,lengthAllowed),checkResult;switch(lengthCheckResults[0]){case"out":this.errorMessage=lang.lengthBadStart+lengthAllowed+lang.lengthBadEnd;checkResult=false;break;case"min":this.errorMessage=lang.lengthTooShortStart+lengthCheckResults[1]+lang.lengthBadEnd;checkResult=false;break;case"max":this.errorMessage=lang.lengthTooLongStart+lengthCheckResults[1]+lang.lengthBadEnd;checkResult=false;break;default:checkResult=true}return checkResult},errorMessage:"",errorMessageKey:""});$.formUtils.addValidator({name:"url",validatorFunction:function(url){var urlFilter=/^(https?|ftp):\/\/((((\w|-|\.|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])(\w|-|\.|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])(\w|-|\.|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/(((\w|-|\.|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/((\w|-|\.|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|\[|\]|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#(((\w|-|\.|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;if(urlFilter.test(url)){var domain=url.split("://")[1],domainSlashPos=domain.indexOf("/");if(domainSlashPos>-1)domain=domain.substr(0,domainSlashPos);return $.formUtils.validators.validate_domain.validatorFunction(domain)}return false},errorMessage:"",errorMessageKey:"badUrl"});$.formUtils.addValidator({name:"number",validatorFunction:function(val,$el,conf){if(val!==""){var allowing=$el.valAttr("allowing")||"",decimalSeparator=$el.valAttr("decimal-separator")||conf.decimalSeparator,allowsRange=false,begin,end,steps=$el.valAttr("step")||"",allowsSteps=false;if(allowing.indexOf("number")==-1)allowing+=",number";if(allowing.indexOf("negative")==-1&&val.indexOf("-")===0){return false}if(allowing.indexOf("range")>-1){begin=parseFloat(allowing.substring(allowing.indexOf("[")+1,allowing.indexOf(";")));end=parseFloat(allowing.substring(allowing.indexOf(";")+1,allowing.indexOf("]")));allowsRange=true}if(steps!="")allowsSteps=true;if(decimalSeparator==","){if(val.indexOf(".")>-1){return false}val=val.replace(",",".")}if(allowing.indexOf("number")>-1&&val.replace(/[0-9-]/g,"")===""&&(!allowsRange||val>=begin&&val<=end)&&(!allowsSteps||val%steps==0)){return true}if(allowing.indexOf("float")>-1&&val.match(new RegExp("^([0-9-]+)\\.([0-9]+)$"))!==null&&(!allowsRange||val>=begin&&val<=end)&&(!allowsSteps||val%steps==0)){return true}}return false},errorMessage:"",errorMessageKey:"badInt"});$.formUtils.addValidator({name:"alphanumeric",validatorFunction:function(val,$el,conf,language){var patternStart="^([a-zA-Z0-9",patternEnd="]+)$",additionalChars=$el.valAttr("allowing"),pattern="";if(additionalChars){pattern=patternStart+additionalChars+patternEnd;var extra=additionalChars.replace(/\\/g,"");
if(extra.indexOf(" ")>-1){extra=extra.replace(" ","");extra+=language.andSpaces||$.formUtils.LANG.andSpaces}this.errorMessage=language.badAlphaNumeric+language.badAlphaNumericExtra+extra}else{pattern=patternStart+patternEnd;this.errorMessage=language.badAlphaNumeric}return new RegExp(pattern).test(val)},errorMessage:"",errorMessageKey:""});$.formUtils.addValidator({name:"custom",validatorFunction:function(val,$el,conf){var regexp=new RegExp($el.valAttr("regexp"));return regexp.test(val)},errorMessage:"",errorMessageKey:"badCustomVal"});$.formUtils.addValidator({name:"date",validatorFunction:function(date,$el,conf){var dateFormat=$el.valAttr("format")||conf.dateFormat||"yyyy-mm-dd";return $.formUtils.parseDate(date,dateFormat)!==false},errorMessage:"",errorMessageKey:"badDate"});$.formUtils.addValidator({name:"checkbox_group",validatorFunction:function(val,$el,conf,lang,$form){var isValid=true,elname=$el.attr("name"),$checkBoxes=$("input[type=checkbox][name^='"+elname+"']",$form),checkedCount=$checkBoxes.filter(":checked").length,qtyAllowed=$el.valAttr("qty");if(qtyAllowed==undefined){var elementType=$el.get(0).nodeName;alert('Attribute "data-validation-qty" is missing from '+elementType+" named "+$el.attr("name"))}var qtyCheckResults=$.formUtils.numericRangeCheck(checkedCount,qtyAllowed);switch(qtyCheckResults[0]){case"out":this.errorMessage=lang.groupCheckedRangeStart+qtyAllowed+lang.groupCheckedEnd;isValid=false;break;case"min":this.errorMessage=lang.groupCheckedTooFewStart+qtyCheckResults[1]+lang.groupCheckedEnd;isValid=false;break;case"max":this.errorMessage=lang.groupCheckedTooManyStart+qtyCheckResults[1]+lang.groupCheckedEnd;isValid=false;break;default:isValid=true}if(!isValid){var _triggerOnBlur=function(){$checkBoxes.unbind("click",_triggerOnBlur);$checkBoxes.filter("*[data-validation]").validateInputOnBlur(lang,conf,false,"blur")};$checkBoxes.bind("click",_triggerOnBlur)}return isValid}})})(jQuery);
