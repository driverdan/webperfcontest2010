/**
 * Ajax Queue Plugin
 * 
 * Homepage: http://jquery.com/plugins/project/ajaxqueue
 * Documentation: http://docs.jquery.com/AjaxQueue
 */

(function($){var c=$.ajax,pendingRequests={},synced=[],syncedData=[];$.ajax=function(a){a=jQuery.extend(a,jQuery.extend({},jQuery.ajaxSettings,a));var b=a.port,_old,pos;switch(a.mode){case"abort":if(pendingRequests[b]){pendingRequests[b].abort()}return pendingRequests[b]=c.apply(this,arguments);case"queue":_old=a.complete;a.complete=function(){if(_old)_old.apply(this,arguments);jQuery([c]).dequeue("ajax"+b)};jQuery([c]).queue("ajax"+b,function(){c(a)});return;case"sync":pos=synced.length;synced[pos]={error:a.error,success:a.success,complete:a.complete,done:false};syncedData[pos]={error:[],success:[],complete:[]};a.error=function(){syncedData[pos].error=arguments};a.success=function(){syncedData[pos].success=arguments};a.complete=function(){syncedData[pos].complete=arguments;synced[pos].done=true;if(pos==0||!synced[pos-1])for(var i=pos;i<synced.length&&synced[i].done;i++){if(synced[i].error)synced[i].error.apply(jQuery,syncedData[i].error);if(synced[i].success)synced[i].success.apply(jQuery,syncedData[i].success);if(synced[i].complete)synced[i].complete.apply(jQuery,syncedData[i].complete);synced[i]=null;syncedData[i]=null}}}return c.apply(this,arguments)}})(jQuery);