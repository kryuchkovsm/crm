(function(){
  describe('MerchantsCtrl', function () {
    var formCtrl, fakeUser, apiService, scope, formValidator, notifyService;
    beforeEach(function(){
      formCtrl = quickmock({
        providerName: 'MerchantsCtrl',
        moduleName: 'crm',
        useActualDependencies: true,
        mockModules: ['QuickMockDemoMocks']
      });
      fakeUser = {name: 'Bob'};
      apiService = formCtrl.$mocks.APIService;  				// local aliases for $mocks can be useful
      scope = formCtrl.$mocks.$scope;										// if you are referencing them often
      formValidator = formCtrl.$mocks.UserFormValidator;
      notifyService = formCtrl.$mocks.NotificationService;
    });
    it('should retrieve the user data when initialized', function(){
      expect(scope.portletHeaderOptions).toEqual({title: 'Settings'});   									// $scope.user should be null
    });
  });
})();
