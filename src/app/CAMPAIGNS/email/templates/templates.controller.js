'use strict';

angular.module('crm')
  .controller('EmailTemplatesCtrl', function ($scope, ModalService, DataStorage, $stateParams, $state, Notification, $timeout, $document, GlobalVars, $filter, DataProcessing, $rootScope) {
    if (!$stateParams.clientID)
      return $rootScope.showSelectClientModal()
    if (!$scope.templateTypes){
      $scope.templateTypes = [];
      DataStorage.anyApiMethod('/emailautoresponders/types').query(function(resp){
        if (resp && resp.TemplateTypes)
          $scope.templateTypes = resp.TemplateTypes;
      });
    }
    var stripHtml = function(html){
      var tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    }
    var initTemplate = function(){
      $scope.editingTpl = {
        Type: 'plain',
        ClientID: $stateParams.clientID,
        //IsActive: true
      };
      $scope.emailBody = {
        html: '',
        text: ''
      };
      if ($stateParams.templateId)
        DataStorage.emailAutorespondersApi.getTemplateById($stateParams.templateId).query(function(resp){
          if (resp && resp.Template) {
            $scope.editingTpl = resp.Template;
            angular.extend($scope.editingTpl, {
              ID: $stateParams.templateId
            });
            if ($scope.editingTpl.IsHtml){
              $scope.emailBody.html = angular.copy($scope.editingTpl.EmailBody)
              $scope.emailBody.text = stripHtml(angular.copy($scope.editingTpl.EmailBody).replace(/<br \/>/g, '\n'))
            }else{
              $scope.emailBody.text = angular.copy($scope.editingTpl.EmailBody)
              $scope.emailBody.html = angular.copy($scope.editingTpl.EmailBody).replace(/(?:\r\n|\r|\n)/g, '<br />')
            }
          }
        });
    };
    $scope.emailTemplatesSafe = $scope.emailTemplatesSafe || [];

    $scope.$watch(function(){
      return $state.current.name
    }, function(val){
      $scope.currentStateName = val
      if (val == 'main.emailtemplates'){
        if (!$scope.emailTemplatesSafe.length) fetch();
      } else initTemplate()

    });

    var fetch = function(cb){
      cb = cb || function(){}
      var req = DataStorage.emailAutorespondersApi.listTemplates().query({clientID: $stateParams.clientID}).$promise
      req.then(function(resp){
        if (resp && resp.Templates) {
          DataProcessing.updateSafeArr(resp.Templates, $scope.emailTemplatesSafe, 'id')
        }
        cb()
      })
    };
    $scope.removeTemplate = function(row){
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/sure.html",
        controller: "DataModalCtrl",
        inputs: {
          data: {
            modalTitle:  $rootScope.translate('campaigns.email.templates.templates.controller.delete-template'),
            modalTxt: $rootScope.translate('campaigns.email.templates.templates.controller.are-you-sure-you-want-to-delete-this-template?')
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          if (result === 'false') return;
          GlobalVars.setLoadingRequestStatus(true)
          DataStorage.emailAutorespondersApi.deleteTemplate(row.id).post(function(resp){
            GlobalVars.setLoadingRequestStatus(false)
            if (resp && resp.Status==0){
              var index = $scope.emailTemplatesSafe.indexOf(row);
              if (index !== -1)
                $scope.emailTemplatesSafe.splice(index, 1);
              Notification.success({message: "Template " + row.name.replace(/</g, "&lt;").replace(/>/g, "&gt;") + ' has been deleted', delay: 5000})
            }
          });
        });
      });
    };

    $scope.addEditTemplate = function(tpl){
      var params = {};
      if (tpl && tpl.id) params = {templateId: tpl.id}
      $state.go('main.emailtemplates.modify', params)
    };

    //Edit template
    if (!$scope.exts)
      DataStorage.anyApiMethod('/emailautoresponders/tokens').query(function(resp){
        if (resp && resp.Tokens)
          $scope.exts = _.map(resp.Tokens, function(token){
            return token.bookmark;
          })
        else
          $scope.exts = ["{$firstname}","{$lastname}","{$phone}","{$email}","{$address1}","{$address2}","{$city}","{$state}",
            "{$zipcode}","{$refundamt}","{$refundtype}","{$signupdate}","{$cclast4digits}","{$recurringchargeamt}","{$customerid}",
            "{$productname}","{$productprice}","{$shippingprice}","{$totalprice}","{$transactionid}","{$trackingno}"]
      });


    $scope.tinymceOptions = {
      format: 'html',
      relative_urls : false,
      forced_root_block : false,
      remove_script_host : true,
      document_base_url: location.origin+"/vendors/tinymce-dist/",
      plugins: [
        "advlist autolink lists link image charmap print preview hr anchor pagebreak",
        "searchreplace wordcount visualblocks visualchars code fullscreen",
        "insertdatetime media nonbreaking save table contextmenu directionality",
        "emoticons template paste textcolor colorpicker textpattern"
      ],
      toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
      toolbar2: "print preview media | forecolor backcolor emoticons"
    };

    $scope.cancel = function(){
      $state.go('main.emailtemplates', {clientID: $stateParams.clientID})
    }

    var scrollToInvalidEl = function(){
      $timeout(function(){
        var someElement = angular.element('.ng-invalid').eq(0);
        if (someElement && someElement.length)
          $document.scrollToElementAnimated(someElement);
      },100);
    }

    $scope.changeTemplateType = function(val){
      if ($scope.editingTpl)
        if (val){
          var type = angular.copy($filter('filterByField')($scope.templateTypes, {id: val})[0]);
          $scope.editingTpl.EmailSubject = type.DefaultSubject;
          $scope.emailBody.text = type.DefaultBody;
          if (type.DefaultBody){
            var normalizedBody = type.DefaultBody.replace(/(?:\r\n|\r|\n)/g, '<br />')
            $scope.emailBody.html = normalizedBody;
            tinyMCE.activeEditor.setContent(normalizedBody)
          }
        }else{
          $scope.editingTpl.EmailSubject = '';
          $scope.emailBody.html = '';
          $scope.emailBody.text = '';
        }
    };

    $scope.createOrUpdateTpl = function(form){
      if (form.$invalid || (!form.$invalid && $scope.editingTpl.IsHtml && !$scope.emailBody.html)) {
        scrollToInvalidEl()
        return;
      }
      var reqObj = angular.copy($scope.editingTpl);
      reqObj.EmailBody = $scope.editingTpl.IsHtml ? $scope.emailBody.html : $scope.emailBody.text
      var method = 'addTemplate';
      if (reqObj.ID) {
        method = 'editTemplate'
        reqObj.id = parseInt(reqObj.ID)
      }

      $scope.savingTpl = true;
      DataStorage.emailAutorespondersApi[method]().post(reqObj, function(resp){
        $scope.savingTpl = false;
        if (resp && !resp.Status){
          fetch(function(){
            var message = $rootScope.translate('campaigns.email.templates.templates.template-edited', {value: reqObj.Name})
            if (method == 'addTemplate')
              message = $rootScope.translate('campaigns.email.templates.templates.template-added', {value: reqObj.Name});
            Notification.success({message: message.replace(/</g, "&lt;").replace(/>/g, "&gt;"), delay: 5000});
            $scope.cancel();
          });
        }


      })
    };

    $scope.showPreview = function(){
      tinyMCE.execCommand('mcePreview')
    };
    $scope.plainTextCursorPos = {};
    $scope.addExt = function(ext){
      if ($scope.editingTpl.IsHtml)
        tinyMCE.activeEditor.execCommand('mceInsertContent', false, ' '+ext+' ');
      else{
        var domElement = angular.element('#plain-text-body')[0];
        if (document.selection) {
          domElement.focus();
          var sel = document.selection.createRange();
          sel.text = ext;
          domElement.focus();
        } else if (domElement.selectionStart || domElement.selectionStart === 0) {
          var startPos = domElement.selectionStart;
          var endPos = domElement.selectionEnd;
          var scrollTop = domElement.scrollTop;
          domElement.value = domElement.value.substring(0, startPos) + ext + domElement.value.substring(endPos, domElement.value.length);
          domElement.focus();
          domElement.selectionStart = startPos + ext.length;
          domElement.selectionEnd = startPos + ext.length;
          domElement.scrollTop = scrollTop;
        } else {
          domElement.value += ext;
          domElement.focus();
        }
        $scope.emailBody.text = angular.element('#plain-text-body').val()
      }
    };

})
