angular
  .module("kmos4.controllers", [])

  .controller("AppCtrl", [
    "$scope",
    "$state",
    "modalService",
    "fontService",
    "$ionicPlatform",
    "$ionicLoading",
    "$ionicPopup",
    "updateService",
    "$timeout",
    "$rootScope",
    function (
      $scope,
      $state,
      modalService,
      fontService,
      $ionicPlatform,
      $ionicLoading,
      $ionicPopup,
      updateService,
      $timeout,
      $rootScope
    ) {
      $scope.$on("$ionicView.beforeLeave", function () {
        $rootScope.fullSubscriptionValid = $scope.fullSubscriptionValid;
        $rootScope.incomeSubscriptionValid = $scope.incomeSubscriptionValid;
        $rootScope.vatSubscriptionValid = $scope.vatSubscriptionValid;
      });
      $rootScope.emailContactDetails = function (emailAddress, emailSubject) {
        if (window.plugins && window.plugins.emailComposer) {
          cordova.plugins.email.open({
            to: emailAddress,
            subject: emailSubject,
          });
        }
      };
      $rootScope.openVideoGuide = function () {
        console.log("bob");
        window.open(
          "https://www.youtube.com/watch?v=FE71ofRVkZQ&t=56s",
          "_system"
        );
      };

      $rootScope.goToWebsite = function () {
        window.open("https://happ-e-tax.co.za/", "_system");
      };

      $rootScope.isEmptyOrSpaces = function (str) {
        return str === null || str.match(/^ *$/) !== null;
      };

      $scope.socialShare = function (message, subject, file, link) {
        console.log("social share clicked");
        // this is the complete list of currently supported params you can pass to the plugin (all optional)
        var options = {
          message: "Share hApp-e-tax:", // not supported on some apps (Facebook, Instagram)
          subject: "Check out this awesome tax app!", // fi. for email
          files: ["", ""], // an array of filenames either locally or remotely
          url: "http://k-mos.com/?page_id=16592",
          chooserTitle: "Pick an app", // Android only, you can override the default share sheet title,
          appPackageName: "com.apple.social.facebook", // Android only, you can provide id of the App you want to share with
        };

        var onSuccess = function (result) {
          console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
          console.log("Shared to app: " + result.app); // On Android result.app since plugin version 5.4.0 this is no longer empty. On iOS it's empty when sharing is cancelled (result.completed=false)
        };

        var onError = function (msg) {
          console.log("Sharing failed with message: " + msg);
        };

        window.plugins.socialsharing.shareWithOptions(
          options,
          onSuccess,
          onError
        );
      };
      $rootScope.goHome = function () {
        $state.go("app.welcome");
      };
      //check for updates

      var dateLastUpdated = "";
      var newPosts = [];
      var getLastUpdated = function () {
        if ($scope.subscriptionCheck == true) {
          updateService.getLastUpdated().then(function (data) {
            updateService.getLastUpdatedPdf().then(function (result) {
              updateService
                .getRemotePdfModifiedDate()
                .then(function (pdfRemoteDate) {
                  updateService
                    .getLastCancelled()
                    .then(function (lastCancelled) {
                      $scope.updateTitle =
                        "Last updated: " + data.date_modified;
                      $scope.dateLastUpdatedPdf = "";
                      if (result) {
                        $scope.dateLastUpdatedPdf = result.date_modified;
                      }
                      $scope.dateLastUpdated = data.date_modified;

                      $scope.remoteLastModifiedPdf =
                        pdfRemoteDate.data[0].pdf_modified;
                      $scope.remoteLastModifiedData =
                        pdfRemoteDate.data[0].data_modified;
                      console.log(
                        "remote pdf mod " + $scope.remoteLastModifiedPdf
                      );
                      console.log("local pdf mod " + $scope.dateLastUpdatedPdf);
                      //$scope.dateLastUpdated = '2017-08-01 00:00:00';
                      updateService
                        .isWithinLastCancelledRange(5)
                        .then(function (isWithinLastCancelledRange) {
                          console.log(
                            "lastCancelled: " + isWithinLastCancelledRange
                          );

                          if (isWithinLastCancelledRange == false) {
                            if (
                              $scope.remoteLastModifiedData >
                              $scope.dateLastUpdated
                            ) {
                              if (
                                $scope.dateLastUpdated > "2018-01-08 21:47:40"
                              ) {
                                var confirmPopup = $ionicPopup.confirm({
                                  title: "Updates are available",
                                  template:
                                    '<div style="text-align:center">Go to the update page?</div>',
                                });
                              } else {
                                var confirmPopup = $ionicPopup.alert({
                                  title: "<b>Essential update required</b>",
                                  template:
                                    '<div style="text-align:left">Before accessing the app for the first time, you are required to perform a full update of the app contents.  This update is essential in order to get you started.</div>',
                                  okText: "Proceed to update screen",
                                });
                              }
                              confirmPopup.then(function (res) {
                                if (res) {
                                  $state.go("app.updateData");
                                  console.log("You are sure");
                                } else {
                                  console.log("You are not sure");
                                  if (lastCancelled) {
                                    updateService
                                      .updateLastCancelled()
                                      .then(function () {
                                        console.log("last cancelled updated");
                                      });
                                  } else {
                                    updateService
                                      .insertLastCancelled()
                                      .then(function () {
                                        console.log("last cancelled inserted");
                                      });
                                  }
                                }
                              });
                              $rootScope.updatesAvailable = true;
                            } else {
                              $scope.haveUpdates =
                                "No new updates are available";
                              $rootScope.updatesAvailable = false;
                            }
                            if (
                              $scope.dateLastUpdated > "2018-01-08 21:47:40" &&
                              $scope.dateLastUpdatedPdf <
                                $scope.remoteLastModifiedPdf
                            ) {
                              var confirmPopup = $ionicPopup.confirm({
                                title: "Updates are available",
                                template:
                                  '<div style="text-align:center">Go to the update page?</div>',
                              });

                              confirmPopup.then(function (res) {
                                if (res) {
                                  $state.go("app.updateData");
                                  console.log("You are sure");
                                } else {
                                  console.log("You are not sure");
                                  if (lastCancelled) {
                                    updateService
                                      .updateLastCancelled()
                                      .then(function () {
                                        console.log("last cancelled updated");
                                      });
                                  } else {
                                    updateService
                                      .insertLastCancelled()
                                      .then(function () {
                                        console.log("last cancelled inserted");
                                      });
                                  }
                                }
                              });
                              $rootScope.updatesAvailable = true;
                            }
                          }
                        });
                      console.log("have updates " + $scope.haveUpdates);
                    });
                });
            });
          });
        }
      };
      $scope.promoCodeApproved = false;
      $scope.corporateEmailApproved = false;
      $scope.initialLoad = true;
      $scope.subscriptionCheck = false;
      $scope.saveEmail = function () {
        updateService.postEmail("bob");
      };
      $scope.openPaywall = function () {
        console.log("boom");
        $scope.fullSubscriptionValid = true;
        $scope.subscriptionCheck = true;
        $scope.initialLoad = false;
      };
      $scope.openPaywallIncome = function () {
        console.log("boom");
        $scope.incomeSubscriptionValid = true;
        $scope.subscriptionCheck = true;
        $scope.initialLoad = false;
      };
      $scope.openPaywallVat = function () {
        console.log("boom");
        $scope.vatSubscriptionValid = true;
        $scope.subscriptionCheck = true;
        $scope.initialLoad = false;
      };
      $scope.showSAITDiscount = function () {
        if ($state.current.name == "app.welcomeIncome") {
          $scope.discountProduct = "com.kmos.happe.yearsubscription20";
          $scope.initialPrice = "489";
          $scope.discountPrice = "389";
        }
        if ($state.current.name == "app.welcomeVAT") {
          $scope.discountProduct = "com.kmos.happe.vatdiscount";
          $scope.initialPrice = "379";
          $scope.discountPrice = "300";
        }
        if ($state.current.name == "app.welcomeFull") {
          $scope.discountProduct = "com.kmos.happe.annual_incomeandvat20";
          $scope.initialPrice = "825";
          $scope.discountPrice = "660";
        }

        var saitPopup = $ionicPopup.alert({
          title: "<b>SAIT MEMBERSHIP PROMOTION DISCOUNT</b>",
          templateUrl: "templates/sait-discount.html",
          scope: $scope,
          okText: "Cancel",
        });

        saitPopup.then(function (res) {
          console.log("Thank you for not eating my delicious ice cream cone");
        });
      };
      $scope.submitSAITDiscount = function (promoCode, promoEmail) {
        console.log("Promo code " + promoCode);
        console.log("Promo email " + promoEmail);

        if (promoCode != "hApp-e-taxSAIT2019") {
          var invalidCodeAlertPopup = $ionicPopup.alert({
            title: "Invalid promo code " + promoCode,
            template:
              "The promo code you have entered is invalid.<br> Please make sure it was typed correctly and try again.<br>The code is case sensitive.",
            scope: $scope,
            okText: "OK",
          });
          invalidCodeAlertPopup.then(function (res) {
            console.log("Thank you for not eating my delicious ice cream cone");
          });
        } else {
          var confirmPopup = $ionicPopup.confirm({
            title: "The code is valid",
            template: "Confirm this is your e-mail: " + promoEmail,
          });
          console.log($state.current.name);
          confirmPopup.then(function (res) {
            if (res) {
              console.log(JSON.stringify($scope.ITAOnlyProduct));
              $scope.promoCodeApproved = true;
              $scope.promoEmail = promoEmail;

              console.log("You are sure");
            } else {
              console.log("You are not sure");
            }
          });
        }
      };
      $scope.submitTrial = async () => {
        const remoteTrialData = await updateService.getRemoteTrial();
        const postTrial = await updateService.postTrial();

        if (postTrial.data.success === true) {
          const subscriptionName = `trial-30`;
          await updateService.insertSubscriptionIntoLocalDB(subscriptionName);
          var confirmPopup = $ionicPopup.confirm({
            title: "Trial info",
            template: "Trial added successfully",
          });
          confirmPopup.then(function (res) {
            if (res) {
              $scope.fullSubscriptionValid = true;
              $scope.subscriptionCheck = true;
              getLastUpdated();
            } else {
              console.log("Not sure!");
            }
          });
        } else {
          if (postTrial.data.message === "used") {
            var confirmPopup = $ionicPopup.confirm({
              title: "Trial Expiration",
              template:
                "It seems you’ve already used up your free trial.  If you’d like a subscription to the Mobile (or Laptop) App, please contact us at info@hApp-e-tax.co.za.",
            });
          }
        }
      };
      $scope.showCorporate = function (subscriptionType) {
        if (subscriptionType !== $scope.subscriptionType) {
          $scope.corporateEmailApproved = false;
        }
        $scope.subscriptionType = subscriptionType;

        $scope.corporatePopup = $ionicPopup.show({
          title: "<b>Corporate Subscriptions</b>",
          templateUrl: "templates/corporate-subscriptions.html",
          scope: $scope,
          okText: "",
        });

        $scope.corporatePopup.then(function (res) {
          console.log("Thank you for not eating my delicious ice cream cone");
        });
      };
      var spinner =
        '<ion-spinner icon="dots" class="spinner-stable"></ion-spinner><br/>';
      $scope.submitCorporateEmail = function (corporateEmail) {
        $scope.corporateEmailApproved = false;
        $scope.corporateSubscriptions = [];

        console.log("Corporate email " + corporateEmail);
        console.log("Corporate Subscription type " + $scope.subscriptionType);

        var confirmPopup = $ionicPopup.confirm({
          title: "Confirm",
          template: "Confirm this is your e-mail: " + corporateEmail,
        });

        confirmPopup.then(function (res) {
          if (res) {
            $ionicLoading.show({ template: spinner });
            updateService
              .getCorporateEmail(corporateEmail)
              .then(function (data) {
                console.log("corporate data " + JSON.stringify(data));
                corporateEmail = corporateEmail.toLowerCase().trim();

                data.data.forEach(function (element) {
                  var receivedEmail = element.email.toLowerCase().trim();

                  if (
                    receivedEmail == corporateEmail &&
                    element.licenses > 0 &&
                    element.license_type == $scope.subscriptionType
                  ) {
                    $scope.corporateEmailApproved = true;
                    $scope.corporateLicenseLength = element.license_length
                      ? element.license_length
                      : "na";
                    $scope.corporateLicenses = element.licenses;
                  }
                });

                if (!$scope.corporateEmailApproved) {
                  $ionicLoading.hide();
                  $ionicPopup.confirm({
                    title: "Error",
                    template:
                      "An error has occurred: you may not have entered your e-mail address accurately. Alternatively, your e-mail address may not be registered on our system or has run out of licences.  For assistance, please contact us at info@hApp-e-tax.co.za.",
                  });
                } else {
                  $scope.registerCorporateUser(corporateEmail);
                  // $ionicPopup.alert({
                  //   title: 'Success',
                  //   template: 'Your e-mail address has been approved. Tap below to proceed to the App.',
                  //   okText:'Proceed to App'
                  // });
                }
              })
              .catch(function (err) {
                console.log(err);
                $ionicPopup.alert({
                  title: "Something went wrong",
                  template: err.message,
                });
              });

            console.log("You are sure");
          } else {
            console.log("You are not sure");
          }
        });
      };

      $scope.registerTrial = () => {};

      $scope.registerCorporateUser = function (corporateEmail) {
        var corporateSubscriptionWithLength = `corporate_subscription-${$scope.corporateLicenseLength}-${$scope.subscriptionType}`;
        updateService
          .insertSubscriptionIntoLocalDB(corporateSubscriptionWithLength)
          .then(function () {
            updateService
              .insertEmailIntoLocalDB(corporateEmail)
              .then(function () {
                var newLicenses = $scope.corporateLicenses - 1;
                updateService
                  .updateCorporateLicenses(
                    corporateEmail,
                    newLicenses,
                    $scope.subscriptionType
                  )
                  .then(function (data) {
                    console.log("updated licenses " + JSON.stringify(data));
                  });
              });
          });
        if ($scope.subscriptionType == "income") {
          $scope.incomeSubscriptionValid = true;
        }
        if ($scope.subscriptionType == "vat") {
          $scope.vatSubscriptionValid = true;
        }
        if ($scope.subscriptionType == "full") {
          $scope.fullSubscriptionValid = true;
        }
        $scope.subscriptionCheck = true;
        $scope.corporatePopup.close();
        $ionicLoading.hide();
        $state.go("app.welcome");
        getLastUpdated();
      };

      $scope.deleteLocalSubscription = function () {
        updateService.deleteLocalSubscription().then(function () {
          console.log("subscription deleted");
        });
        $scope.subscriptionCheck = false;
        $scope.fullSubscriptionValid = false;
        $scope.incomeSubscriptionValid = false;
        $scope.vatSubscriptionValid = false;

        $scope.corporatePopup.close();
      };

      $scope.openDetailsPopup = function (subscriptionType) {
        $scope.subscriptionType = subscriptionType;
        console.log("subscription type " + subscriptionType);
        var detailsPopup = $ionicPopup.alert({
          title: "<b></b>",
          templateUrl: "templates/more-details.html",
          scope: $scope,
          okText: "Close",
        });

        detailsPopup.then(function (res) {
          console.log("Thank you for not eating my delicious ice cream cone");
        });
      };

      $scope.openLockedPopup = function () {
        $scope.lockedPopup = $ionicPopup.alert({
          title:
            "<b>Your current subscription does not allow you to view this content</b>",
          templateUrl: "templates/locked.html",
          //template: ' <button ng-click="goToSubscriptions()" class="button button-block button-balanced button-condensed">Go to subscriptions</button>',
          scope: $scope,
          okText: "Return to previous screen",
        });

        $scope.lockedPopup.then(function (res) {
          console.log("Thank you for not eating my delicious ice cream cone");
        });
      };

      $scope.goToSubscriptions = function () {
        $scope.lockedPopup.close();
        $state.go("app.subscriptions");
      };

      var productIds = [
        "613_tax_app_subscription",
        "com.kmos.happe.yearsubscription20",
        "com.kmos.happe.annual_vat",
        "com.kmos.happe.vatdiscount",
        "com.kmos.happe.annual_incomeandvat",
        "com.kmos.happe.annual_incomeandvat20",
      ]; // <- Add your product Ids here

      $scope.getLocalDbSubscriptions = function () {
        updateService.getSubscriptionsFromLocalDB().then(function (data) {
          updateService.getEmailFromLocalDB().then(function (localDBdata) {
            console.log(`subscription: ${JSON.stringify(data)}`);
            console.log(`email: ${localDBdata.value}`);
          });
        });
      };

      $scope.changeLocalDbSubscription = function () {
        updateService
          .insertSubscriptionIntoLocalDB("corporate_subscription-0-full")
          .then(function () {});
      };
      $ionicPlatform.ready(function () {
        updateService.getSubscriptionsFromLocalDB().then(function (data) {
          if (data.length > 0) {
            var subscriptionLength = 366;
            var subscriptionIsOld = true;
            var subscriptionType = "";
            var hasCorporateSubscription = false;
            data.forEach(function (element) {
              if (
                element.name != "corporate_subscription" &&
                element.name.split("-")[0] != "corporate_subscription"
              ) {
                subscriptionLength = 397;
                subscriptionIsOld = updateService.isDBSubscriptionOld(
                  element.date_modified,
                  subscriptionLength
                );
                if (!subscriptionIsOld) {
                  subscriptionType = element.name.split("-")[1];
                  if (subscriptionType == "income") {
                    $scope.incomeSubscriptionValid = true;
                  }
                  if (subscriptionType == "vat") {
                    $scope.vatSubscriptionValid = true;
                  }
                  if (subscriptionType == "full") {
                    $scope.fullSubscriptionValid = true;
                  }
                  //subscription is in old format
                  if (!subscriptionType) {
                    $scope.incomeSubscriptionValid = true;
                  }
                  $scope.subscriptionCheck = true;
                  $state.go("app.welcome");
                }
              }
              if (
                element.name.split("-")[0] == "corporate_subscription" &&
                element.name.split("-")[1] != 0
              ) {
                subscriptionLength = element.name.split("-")[1];
              }
              if (
                element.name.split("-")[0] == "corporate_subscription" &&
                element.name.split("-")[2]
              ) {
                hasCorporateSubscription = true;
                subscriptionType = element.name.split("-")[2];
                subscriptionIsOld = updateService.isDBSubscriptionOld(
                  element.date_modified,
                  subscriptionLength
                );
                if (!subscriptionIsOld) {
                  if (subscriptionType == "income") {
                    $scope.incomeSubscriptionValid = true;
                  }
                  if (subscriptionType == "vat") {
                    $scope.vatSubscriptionValid = true;
                  }
                  if (subscriptionType == "full") {
                    $scope.fullSubscriptionValid = true;
                  }
                  $scope.subscriptionCheck = true;
                  $state.go("app.welcome");
                } else {
                }
              }

              //corporate subscription in old format
              if (element.name == "corporate_subscription") {
                subscriptionIsOld = updateService.isDBSubscriptionOld(
                  element.date_modified,
                  subscriptionLength
                );
                if (!subscriptionIsOld) {
                  $scope.incomeSubscriptionValid = true;
                  $scope.subscriptionCheck = true;
                  $state.go("app.welcome");
                }
              }

              if (element.name == "trial-30") {
                console.log("trial found");
                subscriptionIsOld = updateService.isDBSubscriptionOld(
                  element.date_modified,
                  30
                );
                if (!subscriptionIsOld) {
                  $scope.fullSubscriptionValid = true;
                  $scope.subscriptionCheck = true;
                  $state.go("app.welcome");
                }
              }
            });
            if (hasCorporateSubscription && subscriptionIsOld) {
              updateService.getEmailFromLocalDB().then(function (localDBdata) {
                if (localDBdata) {
                  var hasLicenses = false;
                  var user_email = localDBdata.value;
                  updateService
                    .getCorporateEmail(user_email)
                    .then(function (remote) {
                      console.log("user email" + user_email);
                      remote.data.forEach(function (element) {
                        if (
                          element.licenses > 0 &&
                          element.license_type == subscriptionType
                        ) {
                          hasLicenses = true;
                          $scope.corporateEmailApproved = true;
                          $scope.corporateLicenseLength = element.license_length
                            ? element.license_length
                            : "na";
                          $scope.corporateLicenses = element.licenses;
                          $scope.subscriptionType = subscriptionType;
                        }
                      });
                      if (hasLicenses) {
                        var corporateSubscriptionWithLength = `corporate_subscription-${$scope.corporateLicenseLength}-${$scope.subscriptionType}`;
                        updateService
                          .insertSubscriptionIntoLocalDB(
                            corporateSubscriptionWithLength
                          )
                          .then(function () {
                            var newLicenses = $scope.corporateLicenses - 1;
                            updateService
                              .updateCorporateLicenses(
                                user_email,
                                newLicenses,
                                $scope.subscriptionType
                              )
                              .then(function (data) {
                                console.log(
                                  "updated licenses " + JSON.stringify(data)
                                );
                              });
                          });
                        if ($scope.subscriptionType == "income") {
                          $scope.incomeSubscriptionValid = true;
                        }
                        if ($scope.subscriptionType == "vat") {
                          $scope.vatSubscriptionValid = true;
                        }
                        if ($scope.subscriptionType == "full") {
                          $scope.fullSubscriptionValid = true;
                        }
                        $scope.subscriptionCheck = true;

                        $state.go("app.welcome");
                      }
                    });
                }
              });
            }

            console.log("Purchase date " + data[data.length - 1].date_modified);
            console.log("Purchase Name " + data[data.length - 1].name);
            var subscriptionIsOld = updateService.isDBSubscriptionOld(
              data[data.length - 1].date_modified,
              subscriptionLength
            );
          }
          inAppPurchase
            .restorePurchases()
            .then(function (purchases) {
              console.log(JSON.stringify(purchases));
              for (var i = 0; i < purchases.length; i++) {
                var parsedReceipt = JSON.parse(purchases[i].receipt);
                if (
                  (purchases[i].productId == "613_tax_app_subscription" &&
                    parsedReceipt.purchaseState == 0) ||
                  (purchases[i].productId ==
                    "com.kmos.happe.yearsubscription20" &&
                    parsedReceipt.purchaseState == 0)
                ) {
                  var subscriptionType = "";
                  if (
                    (purchases[i].productId ==
                      "com.kmos.happe.yearsubscription20" &&
                      parsedReceipt.purchaseState == 0) ||
                    (purchases[i].productId == "613_tax_app_subscription" &&
                      parsedReceipt.purchaseState == 0)
                  ) {
                    $scope.incomeSubscriptionValid = true;
                    $scope.subscriptionCheck = true;
                  }
                  if (
                    (purchases[i].productId == "com.kmos.happe.annual_vat" &&
                      parsedReceipt.purchaseState == 0) ||
                    (purchases[i].productId == "com.kmos.happe.vatdiscount" &&
                      parsedReceipt.purchaseState == 0)
                  ) {
                    $scope.vatSubscriptionValid = true;
                    $scope.subscriptionCheck = true;
                  }
                  if (
                    (purchases[i].productId ==
                      "com.kmos.happe.annual_incomeandvat" &&
                      parsedReceipt.purchaseState == 0) ||
                    (purchases[i].productId ==
                      "com.kmos.happe.annual_incomeandvat20" &&
                      parsedReceipt.purchaseState == 0)
                  ) {
                    $scope.fullSubscriptionValid = true;
                    $scope.subscriptionCheck = true;
                  }

                  //var purchaseState = "purchaseState";
                  console.log("state " + parsedReceipt.purchaseState);
                }
              }
              $timeout(function () {
                $scope.loadProducts();
              }, 500);
              $scope.initialLoad = false;
            })
            .catch(function (err) {
              $ionicLoading.hide();
              console.log(`restorePurchases - error - ${err}`);
              $ionicPopup.alert({
                title: "Something went wrong",
                template: err.message,
              });
              $timeout(function () {
                $scope.loadProducts();
              }, 500);
              $scope.initialLoad = false;
            });
        });

        $timeout(function () {
          getLastUpdated();
        }, 1500);
      });
      $scope.restoreTimeout = function () {
        $timeout(function () {
          inAppPurchase
            .restorePurchases()
            .then(function (purchases) {
              console.log(JSON.stringify(purchases));
              $scope.subscriptionCheck = true;
              $scope.initialLoad = false;
              getLastUpdated();
            })
            .catch(function (err) {
              $ionicLoading.hide();
              console.log(`restoreTimeout-restorePurchases - error - ${err}`);
              $ionicPopup.alert({
                title: "Something went wrong",
                template: err.message,
              });
              $scope.initialLoad = false;
            });
        }, 500);
      };
      $scope.loadProducts = function () {
        $ionicLoading.show({ template: spinner + "Loading Products..." });
        inAppPurchase
          .getProducts(productIds)
          .then(function (products) {
            $ionicLoading.hide();
            var productsTemp = products;
            for (var i = 0; i < productsTemp.length; i++) {
              if (productsTemp[i].productId == "613_tax_app_subscription") {
                $scope.ITAOnlyProduct = productsTemp[i];
              }
              if (
                productsTemp[i].productId == "com.kmos.happe.yearsubscription20"
              ) {
                $scope.ITAOnlyDiscountProduct = productsTemp[i];
              }
              if (productsTemp[i].productId == "com.kmos.happe.annual_vat") {
                $scope.VATOnlyProduct = productsTemp[i];
              }
              if (productsTemp[i].productId == "com.kmos.happe.vatdiscount") {
                $scope.VATOnlyDiscountProduct = productsTemp[i];
              }
              if (
                productsTemp[i].productId ==
                "com.kmos.happe.annual_incomeandvat"
              ) {
                $scope.fullProduct = productsTemp[i];
              }
              if (
                productsTemp[i].productId ==
                "com.kmos.happe.annual_incomeandvat20"
              ) {
                $scope.fullDiscountProduct = productsTemp[i];
              }
            }

            $scope.products = productsTemp;

            console.log("Products: " + JSON.stringify(products));
          })
          .catch(function (err) {
            $ionicLoading.hide();
            console.log(`getproducts - error - ${err}`);
            $ionicPopup.alert({
              title: "Something went wrong",
              template: err.message,
            });
          });
      };

      $scope.subscribe = function (productId) {
        $ionicLoading.show({ template: spinner + "Purchasing..." });
        inAppPurchase
          .subscribe(productId)
          .then(function (data) {
            console.log(JSON.stringify(data));
            var alertPopup = $ionicPopup.alert({
              title: "Purchase was successful!",
              template: "Click OK to go to the App",
            });
            var subscriptionType = "";
            if (
              productId == "com.kmos.happe.yearsubscription20" ||
              productId == "613_tax_app_subscription"
            ) {
              subscriptionType = "income";
            }
            if (
              productId == "com.kmos.happe.annual_vat" ||
              productId == "com.kmos.happe.vatdiscount"
            ) {
              subscriptionType = "vat";
            }
            if (
              productId == "com.kmos.happe.annual_incomeandvat" ||
              productId == "com.kmos.happe.annual_incomeandvat20"
            ) {
              subscriptionType = "full";
            }

            updateService
              .insertSubscriptionIntoLocalDB(`subscription-${subscriptionType}`)
              .then(function () {});
            if (subscriptionType == "income") {
              $scope.incomeSubscriptionValid = true;
            }
            if (subscriptionType == "vat") {
              $scope.vatSubscriptionValid = true;
            }
            if (subscriptionType == "full") {
              $scope.fullSubscriptionValid = true;
            }
            $scope.subscriptionCheck = true;
            $state.go("app.welcome");
            if (productId == "com.kmos.happe.yearsubscription20") {
              updateService
                .postEmail("SAIT", $scope.promoEmail)
                .then(function () {
                  $scope.emailPosted = true;
                  $scope.emailRegistered = true;
                  updateService
                    .insertEmailIntoLocalDB($scope.promoEmail)
                    .then(function () {
                      console.log("email inserted");
                    });
                });
            }
            getLastUpdated();
            $ionicLoading.hide();
          })

          .catch(function (err) {
            $ionicLoading.hide();
            console.log(`subscribe - error - ${err}`);
            $ionicPopup.alert({
              title: "Something went wrong",
              template: err.message,
            });
          });
      };

      // $scope.restore = function () {
      //   $ionicLoading.show({ template: spinner + 'Checking subscriptions...' });
      //   inAppPurchase
      //   .restorePurchases()
      //   .then(function (purchases) {
      //     $ionicLoading.hide();
      //     console.log(JSON.stringify(purchases));
      //     $scope.subscriptionCheck = true;
      //   })
      //   .catch(function (err) {
      //     $ionicLoading.hide();
      //     console.log(`$scope.restore-restorePurchases - error - ${err}`);
      //     $ionicPopup.alert({
      //       title: 'Something went wrong',
      //       template: err.message
      //     });
      //   });
      // };
      //loadProducts();

      $scope.goToProductPage = function (stateName) {
        if (!$scope.products) {
          $scope.loadProducts();
          $state.go(stateName);
        } else {
          $state.go(stateName);
        }
      };

      //set font details
      if (!fontService.getFontAttr("fontSize")) {
        fontService.putFontAttr("fontSize", 14);
      }
      $scope.fontSize = fontService.getFontAttr("fontSize");
      console.log("fontSize " + fontService.getFontAttr("fontSize"));

      $scope.modalService = modalService;

      $scope.isEmpty = function isEmpty(obj) {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) return false;
        }
        return true;
      };

      $scope.clog = function (stuff) {
        console.log(stuff);
      };
      $scope.goToVATIndex = function () {
        $state.go("app.VATIndex");
      };
      $scope.goToVATAct = function () {
        $state.go("app.taxActPost", { postID: 13291, catID: 1525 });
      };

      $scope.goToCustomsIndex = function () {
        $state.go("app.customsIndex");
      };
      $scope.goToCustomsAct = function () {
        $state.go("app.taxActPost", { postID: 14168, catID: 1627 });
      };
    },
  ])

  .controller("taxActIndexCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "taxActDataService",
    "$q",
    function ($scope, $state, $stateParams, taxActDataService, $q) {
      $scope.$on("$ionicView.afterEnter", function () {
        getTaxActCats($stateParams.parentCatID);

        console.log("loop " + $stateParams.parentCatID);
      });
      function getTaxActCats(parentCatID) {
        taxActDataService.getTaxActCats(parentCatID).then(function (data) {
          console.log("getTaxActCats " + JSON.stringify(data));
          $scope.goToTaxActIndex = function (paramVal) {
            $state.go("app.taxActIndex", { parentCatID: paramVal });
          };
          $scope.goToTaxPostsIndex = function (paramVal) {
            $state.go("app.taxPostsIndex", { catID: paramVal });
          };
          $scope.taxActCats = data;

          //   if ($scope.isEmpty(data)) {
          // console.log('poop '+$stateParams.parentCatID);
          // var thisCatID = $stateParams.parentCatID;
          //     $state.go('app.taxPostsIndex',{catID:thisCatID});
          //   }
        });
      }
    },
  ])

  .controller("taxPostCtrl", [
    "$scope",
    "$rootScope",
    "$state",
    "$stateParams",
    "taxActDataService",
    "$ionicPopup",
    "fontService",
    function (
      $scope,
      $rootScope,
      $state,
      $stateParams,
      taxActDataService,
      $ionicPopup,
      fontService
    ) {
      switch ($stateParams.catID) {
        case "598":
          $scope.taxActBar = { "background-color": "#f4af83" };
          break;
        case "1525":
          $scope.taxActBar = { "background-color": "#bdd6ee" };
          break;
        case "1627":
          $scope.taxActBar = { "background-color": "#806000", color: "#00000" };
          break;
        case "1899":
          $scope.taxActBar = { "background-color": "#92d050" };
          break;
        case "1846":
          $scope.taxActBar = { "background-color": "#ff99cc" };
          break;
        case "1876":
          $scope.taxActBar = { "background-color": "#1f3864" };
          break;
        default:
          $scope.taxActBar = { "background-color": "#2d74b5" };
      }
      //if ($stateParams.catID == 598) {$scope.taxActBar = {'background-color':'#f4af83'}}
      $scope.hangingIndent = fontService.getHangingIndent();
      $scope.textStyle = {
        "font-size": fontService.getFontAttr("fontSize") + "px",
        "line-height": fontService.getFontAttr("fontSize") * 1.42 + "px",
      };
      $rootScope.changeFontSize = function (size) {
        fontService.setFontSize(size);
        $scope.textStyle = {
          "font-size": fontService.getFontAttr("fontSize") + "px",
          "line-height": fontService.getFontAttr("fontSize") * 1.42 + "px",
        };
        $scope.hangingIndent = fontService.getHangingIndent();
        console.log("fontsize " + fontService.getFontAttr("fontSize"));
      };
      $scope.$on("$ionicView.afterEnter", function () {
        getTaxActSinglePost($stateParams.postID);
        taxActDataService
          .getCollectionFromPostID($stateParams.postID)
          .then(function (data) {
            $scope.collectionID = data.collection;
            if ($scope.collectionID == 0) {
              $scope.collectionID = $stateParams.catID;
            }
            console.log("collection " + $scope.collectionID);
            taxActDataService
              .getTaxActFull($scope.collectionID)
              .then(function (data) {
                $scope.taxActPostData = data;
              });
            taxActDataService
              .getTaxActTerms($scope.collectionID)
              .then(function (data) {
                $scope.taxActTermsData = data;
              });
          });

        console.log($stateParams.postID);
      });
      function getTaxActSinglePost(postID) {
        var promise = taxActDataService.getTaxActSinglePost(postID);

        promise.then(function (data) {
          $scope.taxActSinglePost = data;

          console.log("Data " + JSON.stringify(data));
        });
      }

      $scope.goToPost = function (postID) {
        // A confirm dialog
        var catName = "";
        var postCollection = 0;
        taxActDataService.getCollectionFromPostID(postID).then(function (data) {
          postCollection = data.collection;
          taxActDataService
            .getPostCategoryNameByPostIDFromDB(postID, postCollection)
            .then(function (response) {
              console.log("response " + JSON.stringify(response));
              catName = response.name;
              var confirmPopup = $ionicPopup.confirm({
                title: "Go to:&nbsp;&nbsp;" + catName,
                template: "<center>Continue to the above location?</center>",
              });

              confirmPopup.then(function (res) {
                if (res) {
                  $state.go("app.taxActPost", {
                    postID: postID,
                    catID: postCollection,
                  });
                  console.log("You are sure");
                } else {
                  console.log("You are not sure");
                }
              });
            });
          console.log("post-collection " + postCollection);
        });

        //$state.transitionTo('app.taxActFull',{postID:postID,catID:597},{inherit:true,reload:true})
      };
    },
  ])
  .controller("taxActFullCtrl", [
    "$rootScope",
    "$scope",
    "$state",
    "$stateParams",
    "taxActDataService",
    "$ionicScrollDelegate",
    "$timeout",
    function (
      $rootScope,
      $scope,
      $state,
      $stateParams,
      taxActDataService,
      $ionicScrollDelegate,
      $timeout
    ) {
      $scope.$on("$ionicView.afterEnter", function () {
        getTaxActFull($stateParams.postID, $stateParams.catID);

        console.log("ScrollHeight " + $scope.scrollHeight);

        console.log(
          "State Post ID " +
            $stateParams.postID +
            " State Cat ID " +
            $stateParams.catID
        );
      });
      function getTaxActFull(postID, catID) {
        var promise = taxActDataService.getTaxActFull(catID);

        promise.then(function (data) {
          var newData = taxActDataService.getSplicedTaxAct(postID, data);
          $scope.taxActFull = data;
          console.log(newData);
          $scope.scrollHeight = 0;
          //if (newData[0].length >5) {$scope.scrollHeight =$scope.scrollToPost(5); }
          //else {$scope.scrollHeight =$scope.scrollToPost(newData[2] );}

          //$scope.taxActFull.unshift(newData[0]);
        });
      }
      var items = [];
      for (var i = 0; i < 1000; i++) items.push(i);
      $scope.items = items;
      console.log(items);

      $scope.scrollToPost = function (itemIndex) {
        var scrollHeight = 0;
        for (var i = 0; i < itemIndex; i++) {
          var itemHeight = $scope.getItemHeight(
            $scope.taxActFull[i].post_content
          );
          itemHeight = parseInt(itemHeight, 10);
          scrollHeight += itemHeight;
          //console.log('POst content '+$scope.taxActFull[i].post_content);
          //console.log('scrollHeight '+itemHeight);
        }

        $ionicScrollDelegate.scrollTo(0, scrollHeight);
        return scrollHeight;
      };

      $scope.goToPost = function (postID) {
        $state.go("app.taxActPost", { postID: postID, catID: 597 });
        //$state.transitionTo('app.taxActFull',{postID:postID,catID:597},{inherit:true,reload:true})
      };

      $scope.getItemHeight = function (text) {
        var dummy = document.getElementById("dummyItem");
        dummy.innerHTML = text;
        //console.log('Text' +text);
        //console.log('Client Height '+dummy.clientHeight);
        return dummy.clientHeight + "px";
        //Make evenly indexed items be 10px taller, for the sake of example
        //console.log('Text' +text+'Client height ' +dummy.clientHeight);

        //console.log('Dummy Text '+ dummy.textContent);

        //var height = 100 + text.length*0.2 + 'px'
        //console.log('Height '+height);
        //return height;
      };
      $scope.goToScroll = function () {
        $ionicScrollDelegate.scrollTo(0, 150, true);
      };
    },
  ])
  .controller("taxActPostCtrl", [
    "$rootScope",
    "$scope",
    "$state",
    "$stateParams",
    "taxActDataService",
    "$ionicScrollDelegate",
    "$timeout",
    "$location",
    "$ionicPopup",
    "notesService",
    "$ionicPopover",
    "modalService",
    "$ionicHistory",
    "$sce",
    "fontService",
    "$window",
    "$ionicLoading",
    "highlightService",
    "$cordovaPrinter",
    "$templateCache",
    "$cordovaClipboard",
    function (
      $rootScope,
      $scope,
      $state,
      $stateParams,
      taxActDataService,
      $ionicScrollDelegate,
      $timeout,
      $location,
      $ionicPopup,
      notesService,
      $ionicPopover,
      modalService,
      $ionicHistory,
      $sce,
      fontService,
      $window,
      $ionicLoading,
      highlightService,
      $cordovaPrinter,
      $templateCache,
      $cordovaClipboard
    ) {
      $scope.goToCE = function (CEName) {
        $state.go("app.showPdf", {
          PdfID: 0,
          PdfName: CEName,
          PdfCollection: "C&E",
        });
      };

      $scope.diagnose = function (postID) {
        taxActDataService.getAmmendmentsAll().then(function (data) {
          console.log("Data: " + JSON.stringify(data));
        });
      };
      $scope.goToNextView = function () {
        console.log("go foreward");
        var viewID = $rootScope.forewardState;
        console.log(
          "current view " + JSON.stringify($ionicHistory.currentView())
        );

        $state.go(viewID);
      };
      var oldSoftBack = $rootScope.$ionicGoBack;
      $rootScope.$ionicGoBack = function () {
        // implement custom behaviour here
        console.log("back button clicked!");
        console.log(
          "previous view " + JSON.stringify($ionicHistory.backView())
        );
        $rootScope.forewardState = $ionicHistory.currentView().stateName;
        console.log("forewardViewStateID " + $rootScope.forewardViewStateID);
        if ($ionicHistory.backView().stateName == "app.taxActPost") {
          $ionicLoading.show({
            template:
              "<ion-spinner></ion-spinner> <br/> Please wait, the page is being loaded...",
          });
          $timeout(function () {
            $ionicHistory.goBack();
          }, 100);
        } else {
          $ionicHistory.goBack();
        }
      };
      $scope.$on("$ionicView.beforeLeave", function () {
        console.log("leaving...");
      });
      $scope.currentLocationForSearch = $stateParams.catID;
      $scope.logger = function (text) {
        var dummyInput = document.getElementById(
          "dummyInput-" + $scope.variableID
        );

        //console.log('scrollPos '+$ionicScrollDelegate.$getByHandle('myPageDelegate').getScrollPosition().top);
        dummyInput.style.top =
          $ionicScrollDelegate
            .$getByHandle("myPageDelegate")
            .getScrollPosition().top + "px";
        dummyInput.focus();
      };
      $scope.searchTerm = $stateParams.searchTerm;

      $scope.highlight = function (haystack, needle) {
        if (!needle) {
          return $sce.trustAsHtml(haystack);
        }
        var needleRegExp = "(?!<a[^>]*?>)(" + needle + ")(?![^<]*?</a>)";
        return $sce.trustAsHtml(
          haystack.replace(new RegExp(needleRegExp, "gi"), function (match) {
            return '<span class="highlightedText">' + match + "</span>";
          })
        );
      };

      $scope.listCanSwipe = true;
      $scope.modalService = modalService;
      $scope.goForeward = function () {
        var forewardView = $ionicHistory.forwardView();
        console.log("foreward " + JSON.stringify(forewardView));
      };
      $scope.goToSinglePost = function (postID, catID) {
        $state.go("app.post", { postID: postID, catID: catID });
      };
      //fontSize

      $rootScope.changeFontSize = function (size) {
        fontService.setFontSize(size);
        $scope.textStyle = {
          "font-size": fontService.getFontAttr("fontSize") + "px",
          "line-height": fontService.getFontAttr("fontSize") * 1.42 + "px",
        };
        $scope.hangingIndent = fontService.getHangingIndent();
        console.log("fontsize " + fontService.getFontAttr("lineHeight"));
      };
      $rootScope.decreaseFontSize = function () {
        fontService.decreaseFontSize();
        $scope.textStyle = {
          "font-size": fontService.getFontAttr("fontSize") + "px",
          "line-height": fontService.getFontAttr("fontSize") * 1.42 + "px",
        };
        $scope.hangingIndent = fontService.getHangingIndent();
      };
      $scope.$on("$ionicView.beforeEnter", function () {
        $ionicLoading.show({
          template:
            "<ion-spinner></ion-spinner> <br/> Please wait, the page is being loaded...",
        });
        $scope.variableID = Math.floor(Math.random() * 100);
      });

      $scope.$on("$ionicView.afterEnter", function () {
        $scope.taxActBarTitle = { color: "inherit" };
        switch ($stateParams.catID) {
          case 598:
            $scope.taxActBar = { "background-color": "#f4b083" };
            break;
          case 1525:
            $scope.taxActBar = { "background-color": "#bdd6ee" };
            $scope.taxActBarTitle = { color: "black" };
            break;
          case 1627:
            $scope.taxActBar = { "background-color": "#806000" };
            break;
          case 1899:
            $scope.taxActBar = { "background-color": "#92d050" };
            break;
          case 1846:
            $scope.taxActBar = { "background-color": "#ff99cc" };
            break;
          case 1876:
            $scope.taxActBar = { "background-color": "#1f3864" };
            break;
          default:
            $scope.taxActBar = { "background-color": "#2d74b5" };
        }
        //if ($stateParams.catID == 598) {$scope.taxActBar = {'background-color':'#f4af83'}}
        $scope.hangingIndent = fontService.getHangingIndent();
        $scope.textStyle = {
          "font-size": fontService.getFontAttr("fontSize") + "px",
          "line-height": fontService.getFontAttr("fontSize") * 1.42 + "px",
        };
        getTaxActPost($stateParams.postID, $stateParams.catID);
        getTaxActTerms($stateParams.catID);

        $scope.initialScrollComplete = false;
        $scope.initialScrollToPost = function (test) {
          console.log("Anchor scroll called");
          var newHash = "post-" + $scope.variableID + "-" + $stateParams.postID;
          console.log("NewHash " + newHash);
          console.log("$stateParams.postID " + $stateParams.postID);
          $location.hash(newHash);

          $ionicScrollDelegate.anchorScroll();
          $ionicScrollDelegate.scrollBy(0, -150, true);
          console.log(
            "top: " +
              $ionicScrollDelegate
                .$getByHandle("myPageDelegate")
                .getScrollPosition().top
          );
          $timeout(function () {
            $scope.initialScrollComplete = true;
            console.log(
              "top: " +
                $ionicScrollDelegate
                  .$getByHandle("myPageDelegate")
                  .getScrollPosition().top
            );
          }, 1200);
        };
        $scope.numberOfPosts = 20;
        $scope.addMoreItems = function (done) {
          console.log("taxActTermsData " + $scope.taxActTermsData.length);
          console.log("numberOfPosts " + $scope.numberOfPosts);
          if ($scope.taxActTermsData.length > $scope.numberOfPosts)
            $scope.numberOfPosts += 10; // load number of more items
          $scope.$broadcast("scroll.infiniteScrollComplete");
        };

        $scope.addItemsToTop = function () {
          $ionicLoading.show({
            template: "<ion-spinner></ion-spinner> ",
          });
          var contentDiv = document.getElementById(
            "content-" + $scope.variableID
          );

          contentDiv.style.visibility = "hidden";
          $scope.showPosts = false;

          if ($scope.beginTermIndex >= 10) {
            $scope.beginTermIndex -= 10;
            $scope.scrollAmount = 10;
          } else {
            //$scope.scrollAmount = $scope.beginTermIndex;
            $scope.beginTermIndex = 0;
          }

          //  $scope.$apply();
          //console.log($scope.beginIndex);
          $timeout(function () {
            var topHash =
              "term-" + $scope.variableID + "-" + $scope.scrollAmount;
            $location.hash(topHash);
            $ionicScrollDelegate.anchorScroll();
            $ionicScrollDelegate.scrollBy(0, -150, true);

            //$scope.initialScrollToPost();
            contentDiv.style.visibility = "visible";
            $ionicLoading.hide();
            $scope.showPosts = true;
          }, 2000);
        };
      });
      $scope.doRefresh = function () {
        $scope.addItemsToTop();

        $scope.$broadcast("scroll.refreshComplete");
      };
      $scope.onChatScroll = function (top) {
        if (
          $ionicScrollDelegate
            .$getByHandle("myPageDelegate")
            .getScrollPosition().top == top &&
          $scope.initialScrollComplete
        ) {
          $scope.addItemsToTop();
        }
      };
      function getTaxActPost(postID, catID) {
        var promise = taxActDataService.getTaxActFull(catID);

        promise.then(function (data) {
          $scope.beginIndex =
            taxActDataService.getPostIDIndex(postID, data) - 10;
          if ($stateParams.searchTerm) {
            var postIDIndex = taxActDataService.getPostIDIndex(postID, data);
            data[postIDIndex].post_content = $scope.highlight(
              data[postIDIndex].post_content,
              $stateParams.searchTerm
            );
            console.log("searchTerm!" + $stateParams.searchTerm);
            console.log("postID!" + data[postIDIndex].post_content);
          }

          //var newData = taxActDataService.getPostBlock(postID,data);
          $scope.taxActPostData = data;
          //$timeout(function(){$scope.initialScrollToPost();},0);
        });
      }

      function getTaxActTerms(catID) {
        var promise = taxActDataService.getTaxActTerms(catID);

        promise.then(function (data) {
          //var newData = taxActDataService.getPostBlock(postID,data);
          $scope.taxActTermsData = data;

          $scope.catName = taxActDataService.getPostCategoryNameByPostID(
            $stateParams.postID,
            $scope.taxActTermsData,
            $scope.taxActPostData
          );

          var postCategoryIndex = taxActDataService.getPostCategoryIndex(
            $stateParams.postID,
            data,
            $scope.taxActPostData
          );
          if (postCategoryIndex >= 10) {
            $scope.beginTermIndex = postCategoryIndex - 10;
          } else {
            $scope.beginTermIndex = 0;
          }
          $timeout(function () {
            $scope.initialScrollToPost();
            $scope.showPosts = true;
            $ionicLoading.hide();
          }, 500);
        });
      }

      $scope.getTermPosts = function (term_id) {
        return taxActDataService.getTermPosts(term_id, $scope.taxActPostData);
      };

      $scope.goToPost = function (postID) {
        // A confirm dialog
        var catName = "";
        var postCollection = 0;
        taxActDataService.getCollectionFromPostID(postID).then(function (data) {
          postCollection = data.collection;
          taxActDataService
            .getPostCategoryNameByPostIDFromDB(postID, postCollection)
            .then(function (response) {
              console.log("response " + JSON.stringify(response));
              catName = response.name;
              var confirmPopup = $ionicPopup.confirm({
                title: "Go to:&nbsp;&nbsp;" + catName,
                template: "<center>Continue to the above location?</center>",
              });

              confirmPopup.then(function (res) {
                if (res) {
                  $state.go("app.taxActPost", {
                    postID: postID,
                    catID: postCollection,
                  });
                  console.log("You are sure");
                } else {
                  console.log("You are not sure");
                }
              });
            });
          console.log("post-collection " + postCollection);
        });

        //$state.transitionTo('app.taxActFull',{postID:postID,catID:597},{inherit:true,reload:true})
      };
      $scope.addSectionToBriefcase = function () {
        $scope.sectionAdded = [];
        notesService.getBriefcases().then(function (data) {
          $scope.briefcases = data;
        });
        var alertPopup = $ionicPopup.alert({
          title: "Briefcases",
          templateUrl: "templates/briefcase-list.html",
          scope: $scope,
          okText: "Done",
        });

        alertPopup.then(function (res) {
          console.log("Thank you for not eating my delicious ice cream cone");
        });
        $scope.goToBriefcases = function () {
          var confirmPopup = $ionicPopup.confirm({
            title: "Create a Briefcase",
            template:
              "This will navigate you to the Briefcases section<br>Continue?",
          });

          confirmPopup.then(function (res) {
            if (res) {
              alertPopup.close();
              $scope.closePopover();

              $state.go("app.briefcasesIndex");
              console.log("You are sure");
            } else {
              console.log("You are not sure");
            }
          });
        };
      };

      $scope.putSectionInBriefcase = function (briefcaseID, index) {
        //check if section is already in briefcaseID
        notesService
          .checkIfSectionInBriefcase(
            briefcaseID,
            $scope.popoverTermID,
            $stateParams.catID,
            $scope.popoverTermType
          )
          .then(function (data) {
            if (data.length > 0) {
              var alertPopup = $ionicPopup.alert({
                title: "This information is already added to your briefcase",
                template: "",
                scope: $scope,
                okText: "OK",
              });

              alertPopup.then(function (res) {
                console.log(
                  "Thank you for not eating my delicious ice cream cone"
                );
              });
            } else {
              notesService
                .putSectionInBriefcase(
                  briefcaseID,
                  $scope.popoverTermID,
                  $stateParams.catID,
                  $scope.popoverTermType
                )
                .then(function (data) {
                  $scope.sectionAdded[index] = true;
                });
            }
          });
      };
      $scope.addNote = function () {
        $scope.note = {
          title: "",
          body: "",
          date: $scope.todayDate,
          section: $scope.popoverTermID,
        };

        var note = $ionicPopup.show({
          template:
            '<input type="text" ng-model="note.title" id="post-note-title" placeholder="Title"/><br><textarea type="text" ng-model="note.body" id="post-note-body" placeholder="Body"></textarea>',
          title: "New note for this location",

          scope: $scope,
          buttons: [
            {
              text: "Cancel",
              onTap: function (e) {
                return;
              },
            },
            {
              text: "<b>Save</b>",
              type: "button-balanced",
              onTap: function (e) {
                var addNote = notesService.addNote(
                  $scope.popoverTermID,
                  $scope.note,
                  "note"
                );
                console.log("addNote " + JSON.stringify(addNote));
              },
            },
          ],
        });
        note.then(function (res) {
          //$scope.stockNotes = notesService.getNotes($scope.ticker);
        });
      };
      $scope.editNote = function (noteOrig, index) {
        $scope.note = {
          title: noteOrig.title,
          id: noteOrig.id,
          body: noteOrig.content,
        };
        var editNote = $ionicPopup.show({
          template:
            '<input type="text" ng-model="note.title" id="post-note-title" placeholder="Title"/><br><textarea type="text" ng-model="note.body" id="post-note-body" placeholder="Body"></textarea>',
          title: "Edit Note",

          scope: $scope,
          buttons: [
            {
              text: "Cancel",
              onTap: function (e) {
                return;
              },
            },
            {
              text: "<b>Save</b>",
              type: "button-balanced",
              onTap: function (e) {
                var updateBriefcase = notesService.updateNote($scope.note);
              },
            },
          ],
        });
        editNote.then(function (res) {
          //$scope.stockNotes = notesService.getNotes($scope.ticker);

          $scope.sectionNotes[index].title = $scope.note.title;
          $scope.sectionNotes[index].content = $scope.note.body;
        });
      };
      $scope.deleteNote = function (noteID, index) {
        var confirmPopup = $ionicPopup.confirm({
          title: "Delete note",
          template: "Delete note permanently?",
        });

        confirmPopup.then(function (res) {
          if (res) {
            console.log("Note ID " + noteID);
            console.log("index " + index);
            var removeNote = notesService.removeNote(noteID);
            console.log("removeNote" + removeNote);
            $scope.sectionNotes.splice(index, 1);
            console.log("You are sure");
          } else {
            console.log("You are not sure");
          }
        });
      };
      $scope.popupLoaded = function () {
        console.log("canvases");
        console.log("popup width " + popupBody[0].width);
        var canvas = document.getElementById("signatureCanvas");

        var signaturePad = new SignaturePad(canvas);

        $scope.clearCanvas = function () {
          signaturePad.clear();
        };

        $scope.saveCanvas = function () {
          var sigImg = signaturePad.toDataURL();
          $scope.signature = sigImg;
        };
      };

      $scope.addDrawing = function () {
        console.log("Drawing popoverTermID " + $scope.popoverTermID);
        $scope.drawing = {
          title: "Drawing",
          body: "",
          date: $scope.todayDate,
          section: $scope.popoverTermID,
        };

        var drawing = $ionicPopup.show({
          template:
            '<canvas ng-init="popupLoaded()" id="signatureCanvas" width="500" height="500" style="border: 1px solid black;"></canvas><br><img ng-src="{{signature}}"/>',
          title: "New Drawing for Section",

          scope: $scope,
          buttons: [
            {
              text: "Cancel",
              onTap: function (e) {
                return;
              },
            },
            {
              text: "<b>Save</b>",
              type: "button-balanced",
              onTap: function (e) {
                notesService.addNote($scope.ticker, $scope.note);
              },
            },
          ],
        });
        drawing.then(function (res) {
          //$scope.stockNotes = notesService.getNotes($scope.ticker);
        });
      };

      $scope.getNotes = function () {
        notesService.getNotes($scope.popoverTermID).then(function (data) {
          $scope.sectionNotes = data;
          $scope.toggleItem = function (item) {
            if ($scope.isItemShown(item)) {
              $scope.shownItem = null;
            } else {
              $scope.shownItem = item;
            }
          };
          $scope.isItemShown = function (item) {
            return $scope.shownItem === item;
          };
          console.log("Notes " + JSON.stringify($scope.sectionNotes));
        });
        //$scope.sectionNotes = [{"id":1,"title":"Flow","section":3,"content":"bob"},{"id":2,"title":"barb","section":3,"content":"blob"}];

        // An alert dialog

        var alertPopup = $ionicPopup.alert({
          title: "Section Notes",
          templateUrl: "templates/item-expand.html",
          scope: $scope,
        });

        alertPopup.then(function (res) {
          console.log("Thank you for not eating my delicious ice cream cone");
        });
      };
      function surroundSelection() {
        var span = document.createElement("span");
        span.style.fontWeight = "bold";
        span.style.color = "green";

        if (window.getSelection) {
          var sel = window.getSelection();
          if (sel.rangeCount) {
            var range = sel.getRangeAt(0).cloneRange();
            range.surroundContents(span);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      }
      function getSafeRanges(dangerous) {
        var a = dangerous.commonAncestorContainer;
        // Starts -- Work inward from the start, selecting the largest safe range
        var s = new Array(0),
          rs = new Array(0);
        if (dangerous.startContainer != a)
          for (var i = dangerous.startContainer; i != a; i = i.parentNode)
            s.push(i);
        if (0 < s.length)
          for (var i = 0; i < s.length; i++) {
            var xs = document.createRange();
            if (i) {
              xs.setStartAfter(s[i - 1]);
              xs.setEndAfter(s[i].lastChild);
            } else {
              xs.setStart(s[i], dangerous.startOffset);
              xs.setEndAfter(
                s[i].nodeType == Node.TEXT_NODE ? s[i] : s[i].lastChild
              );
            }
            rs.push(xs);
          }

        // Ends -- basically the same code reversed
        var e = new Array(0),
          re = new Array(0);
        if (dangerous.endContainer != a)
          for (var i = dangerous.endContainer; i != a; i = i.parentNode)
            e.push(i);
        if (0 < e.length)
          for (var i = 0; i < e.length; i++) {
            var xe = document.createRange();
            if (i) {
              xe.setStartBefore(e[i].firstChild);
              xe.setEndBefore(e[i - 1]);
            } else {
              xe.setStartBefore(
                e[i].nodeType == Node.TEXT_NODE ? e[i] : e[i].firstChild
              );
              xe.setEnd(e[i], dangerous.endOffset);
            }
            re.unshift(xe);
          }

        // Middle -- the uncaptured middle
        if (0 < s.length && 0 < e.length) {
          var xm = document.createRange();
          xm.setStartAfter(s[s.length - 1]);
          xm.setEndBefore(e[e.length - 1]);
        } else {
          return [dangerous];
        }

        // Concat
        rs.push(xm);
        response = rs.concat(re);

        // Send to Console
        return response;
      }
      function highlightRange(range) {
        var newNode = document.createElement("span");
        newNode.setAttribute("class", "highlightedText");
        range.surroundContents(newNode);
      }
      function highlightSelection() {
        var userSelection = window.getSelection().getRangeAt(0);
        var safeRanges = getSafeRanges(userSelection);
        for (var i = 0; i < safeRanges.length; i++) {
          highlightRange(safeRanges[i]);
        }
      }

      function highlightSelection1() {
        var range = window.getSelection().getRangeAt(0),
          span = document.createElement("span");

        span.className = "highlightedText";
        span.appendChild(range.extractContents());
        range.insertNode(span);
      }
      $scope.removeHighlights = function () {
        var highlighterElement = document.getElementById("highlighter-card");
        var b = highlighterElement.getElementsByClassName(
          "highlightedTextSpan"
        );

        while (b.length) {
          var parent = b[0].parentNode;
          while (b[0].firstChild) {
            parent.insertBefore(b[0].firstChild, b[0]);
          }
          parent.removeChild(b[0]);
        }
        var b = highlighterElement.getElementsByClassName("highlightedText");

        while (b.length) {
          var parent = b[0].parentNode;
          while (b[0].firstChild) {
            parent.insertBefore(b[0].firstChild, b[0]);
          }
          parent.removeChild(b[0]);
        }
      };
      function wrapInner(parent, wrapper) {
        if (typeof wrapper === "string")
          wrapper = document.createElement(wrapper);
        wrapper.className = "highlightedTextSpan";
        var div = parent.appendChild(wrapper);

        while (parent.firstChild !== wrapper)
          wrapper.appendChild(parent.firstChild);
      }
      $scope.highlightText = function () {
        var text = "";
        if (window.getSelection) {
          text = window.getSelection().toString();
        } else if (document.selection && document.selection.type != "Control") {
          text = document.selection.createRange().text;
        }
        console.log("text: " + text);
        highlightSelection1();
        var highlighterElement = document.getElementById("highlighter-card");
        var highlighterParagraphs =
          highlighterElement.getElementsByTagName("p");
        for (i = 0; i < highlighterParagraphs.length; i++) {
          wrapInner(highlighterParagraphs[i], "span");
        }
      };
      $scope.postTextHold = function () {
        console.log("post text beez held yo!");
      };
      $scope.makeHighlighterEditable = function () {
        var copyText = "";
        console.log("bob copy");

        $cordovaClipboard.paste().then(
          function (result) {
            // success, use result
            console.log("result: ", +result);
            copyText = result;
          },
          function () {
            // error
            console.log("there vas error");
          }
        );
        //cordova.plugins.clipboard.paste(function (copiedText) { console.log('copiedText: ',copiedText); });

        console.log("copyText: " + copyText);

        console.log(getClipboard());
        //setCaret();
        //var txtElement = document.getElementById('post-highlighter-body');

        //txtElement.setAttribute("contenteditable", true);
        //txtElement.focus();
        /*    window.addEventListener('keyboardWillShow', (event) => {
  // Describe your logic which will be run each time when keyboard is about to be shown.
  console.log(event.keyboardHeight);
  window.Keyboard.hide();
});
*/
      };
      var makeHighlighterEditable = function () {
        //  setCaret();
        //var txtElement = document.getElementById('post-highlighter-body');
        //txtElement.setAttribute("contenteditable", true);
        //txtElement.focus();
        //window.Keyboard.hide();
      };

      function setCaret() {
        var el = document.getElementById("post-highlighter-body");
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(el.childNodes[1], 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        el.focus();
      }

      function getClipboard() {
        var el = document.createElement("textarea");
        document.body.appendChild(el);
        el.focus();
        document.execCommand("paste");
        var value = el.value;
        document.body.removeChild(el);
        return value;
      }
      $scope.openHighlighter = function () {
        if ($scope.popoverTermType == "category") {
          var termPosts = $scope.getTermPosts($scope.popoverTermID);
          var contentForHighlighter =
            notesService.getTermPostsContent(termPosts);
        } else {
          contentForHighlighter = notesService.getPostContentByID(
            $scope.taxActPostData,
            $scope.popoverTermID
          );
        }
        $templateCache.put("my-dynamic-template", contentForHighlighter);
        //$state.go('app.highlighter',{postContent:contentForHighlighter,termID:$scope.popoverTermID});

        $scope.highlighterTermPosts = termPosts;
        $scope.highlighter = {
          title: "",
          body: contentForHighlighter,
          date: $scope.todayDate,
          section: $scope.popoverTermID,
        };
        $scope.highlighterTest = {
          title: "",
          body: "Testing for bobs how many must die!!???",
          date: $scope.todayDate,
          section: $scope.popoverTermID,
        };

        var highlighter = $ionicPopup.show({
          templateUrl: "templates/highlighter-popup.html",
          title: "New highlight for this location",

          scope: $scope,
          buttons: [
            {
              text: "Close",
              onTap: function (e) {
                return;
              },
            },
            {
              text: '<span class="highlighter-button"><b>Highlight selection</b></span>',
              type: "button-balanced",
              onTap: function (e) {
                e.preventDefault();
                $scope.highlightText();
              },
            },
            {
              text: '<span class="highlighter-button"><b>Remove highlights</b></span>',
              type: "button-assertive",
              onTap: function (e) {
                e.preventDefault();
                $scope.removeHighlights();
              },
            },
          ],
        });
        highlighter.then(function (res) {
          //$scope.stockNotes = notesService.getNotes($scope.ticker);
        });
      };

      //popver
      // .fromTemplate() method
      var template =
        '<ion-popover-view class="fit"> <ion-content scroll="false"> <ion-list><ion-item class="title item-text-wrap popover-header" style="border-bottom: 1px solid #ddd;">Options for: {{popoverTermName}}</ion-item><a class="item" ng-click="addNote()" >Add a Note</a><a class="item" ng-click="addSectionToBriefcase()">Add this Info to Briefcase</a><a class="item" ng-click="getNotes()">View Notes</a><a class="item" ng-click="printText()">Print</a></ion-list> </ion-content></ion-popover-view>';

      $scope.popover = $ionicPopover.fromTemplate(template, {
        scope: $scope,
      });

      $scope.openPopover = function ($event, termID, termName, termType) {
        //console.log('popover termid '+termID);
        $scope.popoverTermID = termID;
        $scope.popoverTermName = termName;
        $scope.popoverTermType = termType;
        $scope.pre2014Ammendments = false;
        if ($stateParams.catID == 597 || $stateParams.catID == 598) {
          $scope.pre2014Ammendments = true;
        }
        $scope.popover.show($event);
      };
      $scope.closePopover = function () {
        $scope.popover.hide();
      };
      //Cleanup the popover when we're done with it!
      $scope.$on("$destroy", function () {
        $scope.popover.remove();
      });
      // Execute action on hidden popover
      $scope.$on("popover.hidden", function () {
        // Execute action
      });
      // Execute action on remove popover
      $scope.$on("popover.removed", function () {
        // Execute action
      });
      $scope.getAmendmentDetails = function () {
        taxActDataService
          .getAmmendments($scope.popoverTermID, $scope.popoverTermType)
          .then(function (data) {
            $scope.ammendments = data;
            console.log("popoverTermID " + $scope.popoverTermID);
            console.log("popoverTermtype " + $scope.popoverTermType);

            console.log("Ammendments " + JSON.stringify($scope.ammendments));
          });
        //$scope.sectionNotes = [{"id":1,"title":"Flow","section":3,"content":"bob"},{"id":2,"title":"barb","section":3,"content":"blob"}];

        // An alert dialog

        var alertPopup = $ionicPopup.alert({
          title: "Ammendments",
          templateUrl: "templates/ammendments.html",
          scope: $scope,
        });

        alertPopup.then(function (res) {
          console.log("Thank you for not eating my delicious ice cream cone");
        });
      };

      $scope.printText = function () {
        if ($scope.popoverTermType == "category") {
          var termPosts = $scope.getTermPosts($scope.popoverTermID);
          var contentToPrint = notesService.getTermPostsContent(termPosts);
        } else {
          contentToPrint = notesService.getPostContentByID(
            $scope.taxActPostData,
            $scope.popoverTermID
          );
        }
        if ($cordovaPrinter.isAvailable()) {
          $cordovaPrinter.print(contentToPrint);
        } else {
          alert("Printing is not available on device");
        }
      };
    },
  ])
  .controller("highlighterCtrl", [
    "$scope",
    "$stateParams",
    function ($scope, $stateParams) {
      $scope.$on("$ionicView.afterEnter", function () {
        $scope.highlighter = {
          title: "",
          body: $stateParams.postContent,
          date: $scope.todayDate,
          section: $stateParams.termID,
        };
      });
      function getTaxActPosts(catID) {
        var promise = taxActDataService.getTaxActPosts(catID);

        promise.then(function (data) {
          console.log(data);
          if (!$scope.isEmpty(data)) {
            $scope.taxActPosts = data;
          } else {
            $scope.taxActPosts = [];
            $scope.taxActPosts[0] = {
              title: {
                rendered: "There is no content available in this category",
              },
            };
            //$scope.taxActPosts.title.rendered = 'There is no content available in this category';
            console.log($scope.taxActPosts);
          }
        });
      }
    },
  ])

  .controller("taxPostsIndexCtrl", [
    "$scope",
    "$stateParams",
    "taxActDataService",
    function ($scope, $stateParams, taxActDataService) {
      $scope.$on("$ionicView.afterEnter", function () {
        console.log("parentCatID is " + $stateParams.parentCatID);
        getTaxActPosts($stateParams.catID);
      });
      function getTaxActPosts(catID) {
        var promise = taxActDataService.getTaxActPosts(catID);

        promise.then(function (data) {
          console.log(data);
          if (!$scope.isEmpty(data)) {
            $scope.taxActPosts = data;
          } else {
            $scope.taxActPosts = [];
            $scope.taxActPosts[0] = {
              title: {
                rendered: "There is no content available in this category",
              },
            };
            //$scope.taxActPosts.title.rendered = 'There is no content available in this category';
            console.log($scope.taxActPosts);
          }
        });
      }
    },
  ])

  .controller("SearchCtrl", [
    "$scope",
    "$rootScope",
    "$state",
    "modalService",
    "searchService",
    function ($scope, $rootScope, $state, modalService, searchService) {
      var latestSearchResults = searchService.getLatestSearchResults();
      $scope.searchQuery = latestSearchResults.latestSearchTerm;
      $scope.searchResults = latestSearchResults.latestSearchResults;

      //get recent search terms

      $scope.currentLocation = modalService.currentLocation;
      $scope.searchLocation = {
        id: 0,
      };

      $scope.selectRecentSearch = function (searchTerm) {
        $scope.searchQuery = searchTerm;
      };
      $scope.clearSearchTerms = function () {
        searchService.clearSearchTerms("search");

        $scope.searchTerms = searchService.getSearchTerms("search");
      };

      $scope.closeModal = function () {
        modalService.closeModal();
      };
      $scope.search = function () {
        $scope.searchStatus = 0;
        $scope.searchResults = "";
        startSearch($scope.searchQuery);
      };
      var startSearch = ionic.debounce(function (query) {
        console.log("searchlocation " + $scope.searchLocation.id);
        searchService
          .search(query, $scope.searchLocation.id)
          .then(function (data) {
            var searcharray = data;
            var duplicates = [];
            for (var i = 0; i < searcharray.length; i++) {
              if (searcharray[i].checked != 1) {
                for (var j = 0; j < searcharray.length; j++) {
                  if (
                    searcharray[i].term_id == searcharray[j].term_id &&
                    searcharray[i].ID != searcharray[j].ID
                  ) {
                    if (
                      searcharray[i].term_id != 39 &&
                      searcharray[i].term_id != 80 &&
                      searcharray[i].term_id != 934 &&
                      searcharray[i].term_id != 10 &&
                      searcharray[i].term_id != 35 &&
                      searcharray[i].term_id != 2
                    ) {
                      console.log(
                        "match! " +
                          searcharray[j].term_id +
                          "j: " +
                          j +
                          " i: " +
                          i +
                          " " +
                          searcharray[j].name
                      );
                      searcharray[j].checked = 1;
                      duplicates.push(j);
                    }
                  }
                }
              }
            }
            duplicates.sort(function (a, b) {
              return b - a;
            });
            for (var i = 0; i < duplicates.length; i++) {
              searcharray.splice(duplicates[i], 1);
            }

            //remove search results from non subscribed acts
            var searcharrayLength = searcharray.length;
            var toRemove = [];
            for (var i = 0; i < searcharrayLength; i++) {
              if (
                $rootScope.incomeSubscriptionValid &&
                !$rootScope.fullSubscriptionValid &&
                !$rootScope.vatSubscriptionValid
              ) {
                if (
                  searcharray[i].collection == "1917" ||
                  searcharray[i].collection == "1525" ||
                  searcharray[i].collection == "1627" ||
                  searcharray[i].collection == "1846" ||
                  searcharray[i].collection == "1876" ||
                  searcharray[i].collection == "1899"
                ) {
                  toRemove.push(searcharray[i]);
                }
              }
              if (
                !$rootScope.incomeSubscriptionValid &&
                !$rootScope.fullSubscriptionValid &&
                $rootScope.vatSubscriptionValid
              ) {
                if (
                  searcharray[i].collection == "597" ||
                  searcharray[i].collection == "936" ||
                  searcharray[i].collection == "1010" ||
                  searcharray[i].collection == "1011"
                ) {
                  toRemove.push(searcharray[i]);
                }
              }
            }
            for (var i = 0; i < toRemove.length; i++) {
              searcharray.splice(searcharray.indexOf(toRemove[i]), 1);
            }

            console.log(
              "subscription income" + $rootScope.incomeSubscriptionValid
            );
            console.log("subscription vat" + $rootScope.vatSubscriptionValid);
            console.log("duplicates " + duplicates);
            $scope.searchResults = searcharray;
            searchService.addLatestSearchResults(query, searcharray);

            console.log("searchresult: " + JSON.stringify(data));
            console.log(
              "search array: " + JSON.stringify($scope.searchResults)
            );
            $scope.searchStatus = 1;
          });
      }, 750);

      $scope.goToPost = function (postID, searchTerm) {
        if ($scope.searchTerms) {
          if (!$scope.searchTerms.includes(searchTerm)) {
            searchService.addSearchTerm("search", searchTerm);
          }
        } else {
          searchService.addSearchTerm("search", searchTerm);
        }

        modalService.closeModal();
        searchService.getCollectionFromPostID(postID).then(function (data) {
          if (
            data.collection == 597 ||
            data.collection == 598 ||
            data.collection == 1525 ||
            data.collection == 1627 ||
            data.collection == 1846 ||
            data.collection == 1876 ||
            data.collection == 1899 ||
            data.collection == 2640 ||
            data.collection == 2551 ||
            data.collection == 2575 ||
            data.collection == 2604 ||
            data.collection == 2678 ||
            data.collection == 2658
          ) {
            $state.go("app.taxActPost", {
              postID: postID,
              catID: data.collection,
              searchTerm: searchTerm,
            });
          }
          if (data.collection == 1010) {
            var PdfCollection = "IN";

            searchService.getTermNameFromPostID(postID).then(function (datum) {
              $state.go("app.showPdf", {
                PdfID: postID,
                PdfName: datum.name,
                PdfCollection: PdfCollection,
              });
            });
          }
          if (data.collection == 1011) {
            var PdfCollection = "PN";

            searchService.getTermNameFromPostID(postID).then(function (datum) {
              $state.go("app.showPdf", {
                PdfID: postID,
                PdfName: datum.name,
                PdfCollection: PdfCollection,
              });
            });
          }
          if (data.collection == 1917) {
            var PdfCollection = "VATIN";

            searchService.getTermNameFromPostID(postID).then(function (datum) {
              $state.go("app.showPdf", {
                PdfID: postID,
                PdfName: datum.name,
                PdfCollection: PdfCollection,
              });
            });
          }
          if (data.collection == 2031) {
            var PdfCollection = "PR";

            searchService.getTermNameFromPostID(postID).then(function (datum) {
              $state.go("app.showPdf", {
                PdfID: postID,
                PdfName: datum.name,
                PdfCollection: PdfCollection,
              });
            });
          }
        });
      };
    },
  ])
  .controller("BriefcaseCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "modalService",
    "briefcaseService",
    "notesService",
    "taxActDataService",
    "$ionicPopup",
    "$window",
    "$cordovaPrinter",
    function (
      $scope,
      $state,
      $stateParams,
      modalService,
      briefcaseService,
      notesService,
      taxActDataService,
      $ionicPopup,
      $window,
      $cordovaPrinter
    ) {
      briefcaseService.getBriefcases().then(function (data) {
        $scope.briefcases = data;
      });
      $scope.clearBriefcases = function () {
        var confirmPopup = $ionicPopup.confirm({
          title: "Clear briefcases",
          template: "Delete all briefcases permanently?",
        });

        confirmPopup.then(function (res) {
          if (res) {
            var clearBriefcases = briefcaseService.clearBriefcases();
            briefcaseService.getBriefcases().then(function (data) {
              $scope.briefcases = data;
            });
            console.log("You are sure");
          } else {
            console.log("You are not sure");
          }
        });
      };

      $scope.deleteBriefcase = function (briefcaseID, index) {
        var confirmPopup = $ionicPopup.confirm({
          title: "Delete briefcase",
          template: "Delete this briefcase permanently?",
        });

        confirmPopup.then(function (res) {
          if (res) {
            var clearBriefcases = briefcaseService.deleteBriefcase(briefcaseID);

            $scope.briefcases.splice(index, 1);

            console.log("You are sure");
          } else {
            console.log("You are not sure");
          }
        });
      };

      $scope.addNewBriefcase = function (name) {
        $scope.briefcaseName = { name: "" };
        var briefcase = $ionicPopup.show({
          template:
            '<input type="text" ng-model="briefcaseName.name" id="post-note-title" placeholder="Name"/>',
          title: "New Briefcase",

          scope: $scope,
          buttons: [
            {
              text: "Cancel",
              onTap: function (e) {
                return;
              },
            },
            {
              text: "<b>Save</b>",
              type: "button-balanced",
              onTap: function (e) {
                var addBriefcase = briefcaseService.createNewBriefcase(
                  $scope.briefcaseName.name,
                  $scope.briefcases.length
                );
                console.log("briefcase name " + $scope.briefcaseName.name);
              },
            },
          ],
        });
        briefcase.then(function (res) {
          //$scope.stockNotes = notesService.getNotes($scope.ticker);
          briefcaseService.getBriefcases().then(function (data) {
            $scope.briefcases = data;
          });
        });
      };
      $scope.editBriefcase = function (briefcaseID, briefcaseName, index) {
        $scope.briefcaseName = { name: briefcaseName, id: briefcaseID };
        var briefcase = $ionicPopup.show({
          template:
            '<input type="text" ng-model="briefcaseName.name" id="post-note-title" placeholder="Name"/>',
          title: "Edit Briefcase",

          scope: $scope,
          buttons: [
            {
              text: "Cancel",
              onTap: function (e) {
                return;
              },
            },
            {
              text: "<b>Save</b>",
              type: "button-balanced",
              onTap: function (e) {
                var updateBriefcase = briefcaseService.updateBriefcase(
                  $scope.briefcaseName.id,
                  $scope.briefcaseName.name
                );
                console.log("briefcase id " + $scope.briefcaseName.id);
              },
            },
          ],
        });
        briefcase.then(function (res) {
          //$scope.stockNotes = notesService.getNotes($scope.ticker);
          briefcaseService.getBriefcases().then(function (data) {
            $scope.briefcases = data;
          });
        });
      };

      $scope.goToBriefcase = function (briefcaseID, briefcaseName) {
        $state.go("app.briefcase", {
          briefcaseID: briefcaseID,
          briefcaseName: briefcaseName,
        });
      };
      $scope.signaturePopupLoaded = function (signature) {
        function resizeCanvas() {
          var ratio = Math.max($window.devicePixelRatio || 1, 1);
          console.log("ratio " + ratio);
          canvas.width = canvas.offsetWidth * ratio;
          canvas.height = canvas.offsetHeight * ratio;
          canvas.getContext("2d").scale(ratio, ratio);
          signaturePad.clear(); // otherwise isEmpty() might return incorrect value
        }
        console.log("canvas");
        var canvas = document.getElementById("signatureCanvas");

        var signaturePad = new SignaturePad(canvas, {
          maxWidth: 1,
        });
        resizeCanvas();
        if ($scope.drawing.body) {
          console.log("body!");
          signaturePad.fromDataURL($scope.drawing.body);
        }

        //signaturePad.fromDataURL(signature);
        var popupBody = document.getElementsByClassName("popup-body");
        console.log("popup width " + popupBody[0].offsetWidth);
        canvas.width = popupBody[0].offsetWidth;
        //canvas.height = popupBody[0].offsetHeight;
        $scope.clearCanvas = function () {
          var confirmPopup = $ionicPopup.confirm({
            title: "Clear Drawing",
            template: "Are you sure you want to clear this entire diagram?",
          });

          confirmPopup.then(function (res) {
            if (res) {
              signaturePad.clear();
            } else {
              console.log("You are not sure");
            }
          });
        };

        $scope.saveCanvas = function () {
          var sigImg = signaturePad.toDataURL();
          $scope.signature = sigImg;
          $scope.drawing.body = sigImg;
          if ($scope.drawing.title == "") {
            $scope.drawing.title = "(no-title)";
          }

          notesService.addNote(
            $stateParams.briefcaseID,
            $scope.drawing,
            "drawing"
          );
        };
      };
      $scope.addNote = function () {
        $scope.note = {
          title: "",
          content: "",
          date: $scope.todayDate,
          briefcase: $stateParams.briefcaseID,
        };

        var note = $ionicPopup.show({
          template:
            '<input type="text" ng-model="note.title" id="post-note-title" placeholder="Title"/><br><textarea type="text" ng-model="note.content" id="post-note-body" placeholder="Body"></textarea>',
          title: "New note for this briefcase",

          scope: $scope,
          buttons: [
            {
              text: "Cancel",
              onTap: function (e) {
                return;
              },
            },
            {
              text: "<b>Save</b>",
              type: "button-balanced",
              onTap: function (e) {
                var addNote = briefcaseService.addNote($scope.note);
                addNote.then(function (data) {
                  console.log("lastinsertid " + data.insertId);
                  var addNoteToBriefcase = briefcaseService.addNoteToBriefcase(
                    data.insertId,
                    $stateParams.briefcaseID
                  );
                  addNoteToBriefcase.then(function () {
                    $scope.briefcaseNotes.push($scope.note);
                  });
                });

                console.log("addNote " + JSON.stringify(addNote));
              },
            },
          ],
        });
        note.then(function (res) {
          //$scope.stockNotes = notesService.getNotes($scope.ticker);
        });
      };
      $scope.editNote = function (noteOrig, index) {
        console.log("Note " + JSON.stringify(noteOrig));
        $scope.note = {
          title: noteOrig.title,
          id: noteOrig.id,
          body: noteOrig.content.replace(/<br \/>/g, "\n"),
        };
        var editNote = $ionicPopup.show({
          template:
            '<input type="text" ng-model="note.title" id="post-note-title" placeholder="Title"/><br><textarea  type="text" ng-model="note.body" id="post-note-body" placeholder="Body"></textarea>',
          title: "Note",

          scope: $scope,
          buttons: [
            {
              text: "Cancel",
              onTap: function (e) {
                return;
              },
            },
            {
              text: "<b>Save</b>",
              type: "button-balanced",
              onTap: function (e) {
                var updateBriefcase = notesService.updateNote($scope.note);
              },
            },
          ],
        });
        editNote.then(function (res) {
          //$scope.stockNotes = notesService.getNotes($scope.ticker);

          $scope.briefcaseNotes[index].title = $scope.note.title;
          $scope.briefcaseNotes[index].content = $scope.note.body;
        });
      };
      $scope.deleteNote = function (noteID, index) {
        var confirmPopup = $ionicPopup.confirm({
          title: "Delete note",
          template: "Delete note permanently?",
        });

        confirmPopup.then(function (res) {
          if (res) {
            console.log("Note ID " + noteID);
            console.log("index " + index);
            var removeNote = notesService.removeNote(noteID);
            console.log("removeNote" + removeNote);
            briefcaseService.deleteItemFromBriefcase(noteID);
            $scope.briefcaseNotes.splice(index, 1);
            console.log("You are sure");
          } else {
            console.log("You are not sure");
          }
        });
      };
      $scope.openDrawing = function (index, title, content) {
        var alertPopup = $ionicPopup.alert({
          title: title,
          template: '<img ng-src="' + content + '" />',
        });

        alertPopup.then(function (res) {});
      };
      $scope.editDrawing = function (index, title, content) {
        $scope.drawing = {
          title: title,
          body: content,
          date: $scope.todayDate,
          briefcase: $stateParams.briefcaseID,
        };

        var drawing = $ionicPopup.show({
          template:
            '<input type="text" ng-model="drawing.title" id="post-note-title" placeholder="Title"/><br><canvas ng-init="signaturePopupLoaded(signature)" id="signatureCanvas" width="500" height="500" style="border: 1px solid black;"></canvas>',
          title: "Edit Drawing",

          scope: $scope,
          buttons: [
            {
              text: "Cancel",
              onTap: function (e) {
                return;
              },
            },
            {
              text: "<b>Clear</b>",
              type: "button-assertive",
              onTap: function (e) {
                e.preventDefault();
                $scope.clearCanvas();
              },
            },
            {
              text: "<b>Save</b>",
              type: "button-balanced",
              onTap: function (e) {
                $scope.saveCanvas();
              },
            },
          ],
        });
        drawing.then(function (res) {
          notesService
            .getDrawings($stateParams.briefcaseID)
            .then(function (data) {
              $scope.briefcaseDrawings = data;
            });
        });
      };
      $scope.addDrawing = function () {
        $scope.drawing = {
          title: "",
          body: $scope.signature,
          date: $scope.todayDate,
          briefcase: $stateParams.briefcaseID,
        };

        var drawing = $ionicPopup.show({
          template:
            '<input type="text" ng-model="drawing.title" id="post-note-title" placeholder="Title"/><br><canvas ng-init="signaturePopupLoaded(signature)" id="signatureCanvas" width="500" height="500" style="border: 1px solid black;"></canvas>',
          title: "New Drawing for Section",

          scope: $scope,
          buttons: [
            {
              text: "Cancel",
              onTap: function (e) {
                return;
              },
            },
            {
              text: "<b>Clear</b>",
              type: "button-assertive",
              onTap: function (e) {
                e.preventDefault();
                $scope.clearCanvas();
              },
            },
            {
              text: "<b>Save</b>",
              type: "button-balanced",
              onTap: function (e) {
                $scope.saveCanvas();
              },
            },
          ],
        });
        drawing.then(function (res) {
          notesService
            .getDrawings($stateParams.briefcaseID)
            .then(function (data) {
              $scope.briefcaseDrawings = data;
            });
        });
      };
      notesService.getDrawings($stateParams.briefcaseID).then(function (data) {
        $scope.briefcaseDrawings = data;
      });
      briefcaseService
        .getITASections($stateParams.briefcaseID)
        .then(function (data) {
          $scope.briefcaseITASections = data;
        });
      briefcaseService
        .getParagraphs($stateParams.briefcaseID)
        .then(function (data) {
          $scope.briefcaseParagraphs = data;
        });
      briefcaseService
        .getTAASections($stateParams.briefcaseID)
        .then(function (data) {
          $scope.briefcaseTAASections = data;
        });
      briefcaseService
        .getVATASections($stateParams.briefcaseID)
        .then(function (data) {
          $scope.briefcaseVATASections = data;
        });
      briefcaseService
        .getCEASections($stateParams.briefcaseID)
        .then(function (data) {
          $scope.briefcaseCEASections = data;
        });
      briefcaseService
        .getEDASections($stateParams.briefcaseID)
        .then(function (data) {
          $scope.briefcaseEDASections = data;
        });
      briefcaseService
        .getTDASections($stateParams.briefcaseID)
        .then(function (data) {
          $scope.briefcaseTDASections = data;
        });
      briefcaseService
        .getSTTASections($stateParams.briefcaseID)
        .then(function (data) {
          $scope.briefcaseSTTASections = data;
        });
      briefcaseService
        .getMPRASections($stateParams.briefcaseID)
        .then(function (data) {
          $scope.briefcaseMPRASections = data;
        });
      briefcaseService
        .getMPRAASections($stateParams.briefcaseID)
        .then(function (data) {
          $scope.briefcaseMPRAASections = data;
        });
      briefcaseService
        .getETISections($stateParams.briefcaseID)
        .then(function (data) {
          $scope.briefcaseETISections = data;
        });
      briefcaseService
        .getCTASections($stateParams.briefcaseID)
        .then(function (data) {
          $scope.briefcaseCTASections = data;
        });
      briefcaseService
        .getSTTAASections($stateParams.briefcaseID)
        .then(function (data) {
          $scope.briefcaseSTTAASections = data;
        });
      briefcaseService
        .getUIFSections($stateParams.briefcaseID)
        .then(function (data) {
          $scope.briefcaseUIFSections = data;
        });
      briefcaseService
        .getSDLSections($stateParams.briefcaseID)
        .then(function (data) {
          $scope.briefcaseSDLSections = data;
        });

      briefcaseService.getOther($stateParams.briefcaseID).then(function (data) {
        $scope.briefcaseOthers = data;
      });
      briefcaseService
        .getDefinitions($stateParams.briefcaseID)
        .then(function (data) {
          $scope.briefcaseDefinitions = data;
        });
      briefcaseService.getPosts($stateParams.briefcaseID).then(function (data) {
        for (var i = 0; i < data.length; i++) {
          var item = {};
          item.name = data[i].post_title;
          item.item_id = data[i].item_id;
          item.item_type = data[i].item_type;
          $scope.briefcaseITASections.push(item);
        }
      });
      $scope.deleteSectionFromBriefcase = function (
        sectionID,
        index,
        sectionsArray
      ) {
        var confirmPopup = $ionicPopup.confirm({
          title: "Delete",
          template: "Delete permanently?",
        });

        confirmPopup.then(function (res) {
          if (res) {
            briefcaseService.deleteItemFromBriefcase(sectionID);
            sectionsArray.splice(index, 1);
            console.log("You are sure");
          } else {
            console.log("You are not sure");
          }
        });
      };
      briefcaseService.getNotes($stateParams.briefcaseID).then(function (data) {
        $scope.briefcaseNotes = data;
        console.log("briefcaseNotes " + JSON.stringify(data));
      });
      $scope.goToSection = function (sectionID, sectionItemType) {
        console.log("SectionID " + sectionID);
        var sectionItemTypeArray = sectionItemType.split(",");
        var collectionID = sectionItemTypeArray[1];
        if (sectionItemTypeArray[0] == "section") {
          briefcaseService
            .getFirstPostIDFromSectionID(sectionID)
            .then(function (data) {
              var firstPost = data;
              console.log(
                "first post " + JSON.stringify(firstPost[0].object_id)
              );
              $state.go("app.taxActPost", {
                postID: firstPost[0].object_id,
                catID: collectionID,
              });
            });
        }
        if (
          sectionItemTypeArray[0] == "post" ||
          sectionItemTypeArray[0] == "definition"
        ) {
          $state.go("app.taxActPost", {
            postID: sectionID,
            catID: collectionID,
          });
        }
      };

      $scope.goToOther = function (item_id, item_name, item_type) {
        var item_type_split = item_type.split(",");
        var item_collection = item_type_split[1];
        $state.go("app.showPdf", {
          PdfID: item_id,
          PdfName: item_name,
          PdfCollection: item_collection,
        });
      };

      $scope.removeDrawing = function (drawingID, index) {
        var confirmPopup = $ionicPopup.confirm({
          title: "Delete Drawing",
          template: "Delete this drawing permanently?",
        });

        confirmPopup.then(function (res) {
          if (res) {
            var clearBriefcases = notesService.removeNote(drawingID);
            briefcaseService.deleteItemFromBriefcase(drawingID);
            $scope.briefcaseDrawings.splice(index, 1);

            console.log("You are sure");
          } else {
            console.log("You are not sure");
          }
        });
      };
      $scope.printBriefcaseContents = function () {
        var contentToPrint = "";

        if ($scope.briefcaseNotes.length > 0) {
          contentToPrint += `<h2>Notes</h2>`;
          for (let note of $scope.briefcaseNotes) {
            contentToPrint += `<h3>${note.title}</h3>`;
            contentToPrint += `<p>${note.content}</p>`;
          }
          contentToPrint += `<hr>`;
        }
        if ($scope.briefcaseDrawings.length > 0) {
          contentToPrint += `<h2>Drawings</h2>`;
          for (let drawing of $scope.briefcaseDrawings) {
            contentToPrint += `<h3>${drawing.title}</h3>`;
            contentToPrint += `<img src="${drawing.content}" style="max-height:500px" />`;
          }
          contentToPrint += `<hr>`;
        }

        const contentCats = [
          { title: "Definition", name: "briefcaseDefinitions" },
          {
            title: "Sections of the Income Tax Act",
            name: "briefcaseITASections",
          },
          { title: "Paragraphs of Schedules", name: "briefcaseParagraphs" },
          {
            title: "Sections of the Tax Administration Act",
            name: "briefcaseTAASections",
          },
          { title: "Sections of the VAT Act", name: "briefcaseVATASections" },
          {
            title: "Sections of the Customs and Excise Act",
            name: "briefcaseCEASections",
          },
          {
            title: "Sections of the Estate Duty Act",
            name: "briefcaseEDASections",
          },
          {
            title: "Sections of the Transfer Duty Act",
            name: "briefcaseTDASections",
          },
          {
            title: "Sections of the Securities Transfer Tax Act",
            name: "briefcaseSTTASections",
          },
          { title: "Sections of the MPRR Act", name: "briefcaseMPRASections" },
          {
            title: "Sections of the MPRRA Act",
            name: "briefcaseMPRAASections",
          },
          {
            title: "Sections of the Employees Tax Incentive Act",
            name: "briefcaseETISections",
          },
          {
            title: "Sections of the Carbon Tax Act",
            name: "briefcaseCTASections",
          },
          {
            title: "Sections of the STT Administration Act",
            name: "briefcaseSTTAASections",
          },
          { title: "Sections of the UIF Act", name: "briefcaseUIFSections" },
          {
            title: "Sections of the Skills Development Levies Act",
            name: "briefcaseSDLSections",
          },
          { title: "Other Information", name: "briefcaseOthers" },
        ];
        for (let cat of contentCats) {
          const contentNameProp =
            cat.name === "briefcaseDefinitions" ? "post_title" : "name";
          if ($scope[cat.name].length > 0) {
            contentToPrint += `<h2>${cat.title}</h2>`;
            for (let item of $scope[cat.name]) {
              contentToPrint += `<p>${item[contentNameProp]}</p>`;
            }
            contentToPrint += `<hr>`;
          }
        }
        if ($cordovaPrinter.isAvailable()) {
          $cordovaPrinter.print(contentToPrint);
        } else {
          alert("Printing is not available on device");
        }
      };

      $scope.briefcaseName = $stateParams.briefcaseName;
    },
  ])

  .controller("DTAIndexCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "modalService",
    "$ionicPopup",
    "DTAService",
    function (
      $scope,
      $state,
      $stateParams,
      modalService,
      $ionicPopup,
      DTAService
    ) {
      $scope.goToDTAList = function (parentID, parentName) {
        $state.go("app.DTAList", {
          parentID: parentID,
          parentName: parentName,
        });
      };

      $scope.parentName = $stateParams.parentName;
      $scope.goToDTA = function (dtaID, dtaName) {
        $state.go("app.showPdf", {
          PdfID: dtaID,
          PdfName: dtaName,
          PdfCollection: "DTA",
        });
      };
      DTAService.getDTAs($stateParams.parentID).then(function (data) {
        $scope.dtas = data;
      });
    },
  ])
  .controller("SARSIndexCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "modalService",
    "$ionicPopup",
    "DTAService",
    function (
      $scope,
      $state,
      $stateParams,
      modalService,
      $ionicPopup,
      DTAService
    ) {
      $scope.reactiveColor = { "background-color": "#6ce2ee" };

      $scope.goToITAIN = function (parentID, parentName) {
        $state.go("app.SARSINList", {
          parentID: parentID,
          parentName: parentName,
        });
      };

      $scope.goToITAPN = function (parentID, parentName) {
        $state.go("app.SARSPNList", {
          parentID: parentID,
          parentName: parentName,
        });
      };

      $scope.goToVATIN = function (parentID, parentName) {
        $state.go("app.SARSVATINList", {
          parentID: parentID,
          parentName: parentName,
        });
      };

      // $scope.goToSG = function () {
      //   $state.go("app.showPdf", { PdfCollection: "SG" });
      // };

      $scope.parentName = $stateParams.parentName;
      $scope.goToDTA = function (dtaID, dtaName) {
        $state.go("app.showPdf", {
          PdfID: dtaID,
          PdfName: dtaName,
          PdfCollection: "DTA",
        });
      };
      DTAService.getDTAs($stateParams.parentID).then(function (data) {
        $scope.dtas = data;
      });

      $scope.goToSG = function (sarsINID, sarsINName) {
        $state.go("app.showPdf", {
          PdfID: sarsINID,
          PdfName: sarsINName,
          PdfCollection: "SG",
        });
      };
      DTAService.getSGs().then(function (data) {
        $scope.SGs = data;
      });
    },
  ])
  .controller("SARSINListCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "modalService",
    "$ionicPopup",
    "DTAService",
    function (
      $scope,
      $state,
      $stateParams,
      modalService,
      $ionicPopup,
      DTAService
    ) {
      $scope.reactiveColor = { "background-color": "#6ce2ee" };

      $scope.goToIN = function (sarsINID, sarsINName) {
        $state.go("app.showPdf", {
          PdfID: sarsINID,
          PdfName: sarsINName,
          PdfCollection: "IN",
        });
      };
      DTAService.getSARSINs($stateParams.parentID).then(function (data) {
        $scope.INs = data;
      });
    },
  ])

  .controller("SARSPNListCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "modalService",
    "$ionicPopup",
    "DTAService",
    function (
      $scope,
      $state,
      $stateParams,
      modalService,
      $ionicPopup,
      DTAService
    ) {
      $scope.reactiveColor = { "background-color": "#6ce2ee" };

      $scope.goToPN = function (sarsPNID, sarsPNName) {
        $state.go("app.showPdf", {
          PdfID: sarsPNID,
          PdfName: sarsPNName,
          PdfCollection: "PN",
        });
      };
      DTAService.getSARSPNs($stateParams.parentID).then(function (data) {
        $scope.PNs = data;
      });
    },
  ])
  .controller("SARSVATINListCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "modalService",
    "$ionicPopup",
    "DTAService",
    function (
      $scope,
      $state,
      $stateParams,
      modalService,
      $ionicPopup,
      DTAService
    ) {
      $scope.reactiveColor = { "background-color": "#6ce2ee" };

      $scope.goToVATIN = function (sarsINID, sarsINName) {
        $state.go("app.showPdf", {
          PdfID: sarsINID,
          PdfName: sarsINName,
          PdfCollection: "VATIN",
        });
      };
      DTAService.getSARSVATINs($stateParams.parentID).then(function (data) {
        $scope.VATINs = data;
      });
    },
  ])
  .controller("SARSSGListCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "modalService",
    "$ionicPopup",
    "DTAService",
    function (
      $scope,
      $state,
      $stateParams,
      modalService,
      $ionicPopup,
      DTAService
    ) {
      $scope.reactiveColor = { "background-color": "#6ce2ee" };

      $scope.goToSG = function (sarsINID, sarsINName) {
        $state.go("app.showPdf", {
          PdfID: sarsINID,
          PdfName: sarsINName,
          PdfCollection: "SG",
        });
      };
      DTAService.getSGs().then(function (data) {
        $scope.SGs = data;
      });
    },
  ])
  .controller("PRIndexCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "modalService",
    "$ionicPopup",
    "DTAService",
    function (
      $scope,
      $state,
      $stateParams,
      modalService,
      $ionicPopup,
      DTAService
    ) {
      $scope.reactiveColor = { "background-color": "#c45911", color: "white" };

      $scope.goToITAIN = function (parentID, parentName) {
        $state.go("app.PRBCRList", {
          parentID: parentID,
          parentName: parentName,
        });
      };

      $scope.goToITAPN = function (parentID, parentName) {
        $state.go("app.PRBGRList", {
          parentID: parentID,
          parentName: parentName,
        });
      };

      $scope.goToVATIN = function (parentID, parentName) {
        $state.go("app.PRBPRList", {
          parentID: parentID,
          parentName: parentName,
        });
      };

      $scope.parentName = $stateParams.parentName;
      $scope.goToDTA = function (dtaID, dtaName) {
        $state.go("app.showPdf", {
          PdfID: dtaID,
          PdfName: dtaName,
          PdfCollection: "DTA",
        });
      };
      DTAService.getDTAs($stateParams.parentID).then(function (data) {
        $scope.dtas = data;
      });
    },
  ])
  .controller("PRBCRListCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "modalService",
    "$ionicPopup",
    "DTAService",
    function (
      $scope,
      $state,
      $stateParams,
      modalService,
      $ionicPopup,
      DTAService
    ) {
      $scope.reactiveColor = { "background-color": "#c45911", color: "white" };

      $scope.goToIN = function (sarsINID, sarsINName) {
        $state.go("app.showPdf", {
          PdfID: sarsINID,
          PdfName: sarsINName,
          PdfCollection: "PR",
        });
      };
      console.log("state parent id:" + $stateParams.parentID);
      DTAService.getSARSINs($stateParams.parentID).then(function (data) {
        $scope.INs = data;
      });
    },
  ])
  .controller("PRBGRListCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "modalService",
    "$ionicPopup",
    "DTAService",
    function (
      $scope,
      $state,
      $stateParams,
      modalService,
      $ionicPopup,
      DTAService
    ) {
      $scope.reactiveColor = { "background-color": "#c45911", color: "white" };

      $scope.goToIN = function (sarsINID, sarsINName) {
        $state.go("app.showPdf", {
          PdfID: sarsINID,
          PdfName: sarsINName,
          PdfCollection: "PR",
        });
      };
      DTAService.getSARSINs($stateParams.parentID).then(function (data) {
        $scope.INs = data;
      });
    },
  ])
  .controller("PRBPRListCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "modalService",
    "$ionicPopup",
    "DTAService",
    function (
      $scope,
      $state,
      $stateParams,
      modalService,
      $ionicPopup,
      DTAService
    ) {
      $scope.reactiveColor = { "background-color": "#c45911", color: "white" };

      $scope.goToIN = function (sarsINID, sarsINName) {
        $state.go("app.showPdf", {
          PdfID: sarsINID,
          PdfName: sarsINName,
          PdfCollection: "PR",
        });
      };
      DTAService.getSARSINs($stateParams.parentID).then(function (data) {
        $scope.INs = data;
      });
    },
  ])
  .controller("showPdfCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "modalService",
    "$ionicPopup",
    "DTAService",
    "notesService",
    "taxActDataService",
    "$ionicScrollDelegate",
    "$timeout",
    "$cordovaPrinter",
    function (
      $scope,
      $state,
      $stateParams,
      modalService,
      $ionicPopup,
      DTAService,
      notesService,
      taxActDataService,
      $ionicScrollDelegate,
      $timeout,
      $cordovaPrinter
    ) {
      $timeout(function () {
        $ionicScrollDelegate.resize();
      }, 1200);

      //   function _base64ToArrayBuffer(base64) {
      //     var binary_string =  window.atob(base64);
      //     var len = binary_string.length;
      //     var bytes = new Uint8Array( len );
      //     for (var i = 0; i < len; i++)        {
      //         bytes[i] = binary_string.charCodeAt(i);
      //     }
      //     return bytes.buffer;
      // }
      //   function stripHtml(html){
      //     // Create a new div element
      //     var temporalDivElement = document.createElement("div");
      //     // Set the HTML content with the providen
      //     temporalDivElement.innerHTML = html;
      //     // Retrieve the text property of the element (cross-browser support)
      //     return temporalDivElement.textContent || temporalDivElement.innerText || "";
      // }

      $scope.listCanSwipe = true;
      $scope.logSwiped = function () {
        console.log("swiped");
      };
      $scope.title = $stateParams.PdfName;

      $scope.goToNext = function () {
        pdfDelegate.$getByHandle("dta-handler").next();
      };
      $scope.goNextTest = function () {
        console.log("nexting");
        goNext();
      };

      console.log("pdfid " + $stateParams.PdfID);

      // var base64ArrayBuffer = _base64ToArrayBuffer(stripHtml(data.post_content));
      // currentBlob = new Blob([base64ArrayBuffer], {type: 'application/pdf'});
      // $scope.pdfUrl = URL.createObjectURL(currentBlob);

      var pdfFolderPath = "cdvfile://localhost/persistent/pdfs/";

      if ($stateParams.PdfCollection == "PN") {
        var sarsPNName = $stateParams.PdfName.split("Practice Note ");

        var secondHalf = sarsPNName[1];

        var secondHalfSplit = secondHalf.split(" ");
        var PNNumber = secondHalfSplit[0];

        console.log("PNNumber " + PNNumber);

        $scope.pdfUrl = pdfFolderPath + "PN/PN" + PNNumber + ".pdf";
        //  console.log('dta nams '+$stateParams.dtaName);
      }
      if ($stateParams.PdfCollection == "DTA") {
        var dtaName = $stateParams.PdfName.split(" - ");
        var country = dtaName[0];

        country = country.replace(/ /g, "_");

        console.log("country " + country);

        $scope.pdfUrl = pdfFolderPath + "DTA/DTA_" + country + ".pdf";
        console.log("dta nams " + $scope.pdfUrl);
      }
      if ($stateParams.PdfCollection == "IN") {
        var sarsINName = $stateParams.PdfName.split("Interpretation Note ");

        var secondHalf = sarsINName[1];

        var secondHalfSplit = secondHalf.split(" ");
        var INNumber = secondHalfSplit[0];

        console.log("INNumber " + INNumber);
        console.log("PDF ID " + $stateParams.PdfID);

        $scope.pdfUrl = pdfFolderPath + "IN/ITA/IN" + INNumber + ".pdf";
        console.log("dta nams " + $stateParams.dtaName);
      }

      if ($stateParams.PdfCollection == "VATIN") {
        var sarsVATINName = $stateParams.PdfName.split("Interpretation Note ");

        var secondHalf = sarsVATINName[1];

        var secondHalfSplit = secondHalf.split(" ");
        var INNumber = secondHalfSplit[0];

        //console.log('INNumber ' + INNumber);

        $scope.pdfUrl = pdfFolderPath + "IN/VAT/IN" + INNumber + ".pdf";
        //  console.log('dta nams '+$stateParams.dtaName);
      }

      if ($stateParams.PdfCollection == "PR") {
        var PRName = $stateParams.PdfName.split(" ")[0];
        var res = PRName.charAt(1);
        var folder = "";
        console.log("INNumber " + res);

        $scope.pdfUrl = `${pdfFolderPath}PR/B${res}R/${PRName}.pdf`;
        //  console.log('dta nams '+$stateParams.dtaName);
      }

      console.log("other or cande");
      if ($stateParams.PdfCollection == "other") {
        $scope.pdfUrl = pdfFolderPath + $stateParams.PdfName + ".pdf";
        var title = $stateParams.PdfName.replace(/_/g, " ");
        $scope.title = title;
      }

      if ($stateParams.PdfCollection == "C&E") {
        var CEName = $stateParams.PdfName;
        //console.log('INNumber ' + INNumber);
        $scope.pdfUrl = pdfFolderPath + "C_E/" + CEName + ".pdf";
        //  console.log('dta nams '+$stateParams.dtaName);
      }

      if ($stateParams.PdfCollection == "OTL") {
        var OTLName = $stateParams.PdfName.split("(")[1].split(")")[0];
        console.log("OTLName " + OTLName);
        $scope.pdfUrl = pdfFolderPath + "OTL/" + OTLName + ".pdf";
        //  console.log('dta nams '+$stateParams.dtaName);
      }

      if ($stateParams.PdfCollection == "RGN") {
        var RGNName = $stateParams.PdfName.split(" ")[0];
        console.log("RGNName " + RGNName);
        $scope.pdfUrl = pdfFolderPath + "RGN/" + RGNName + ".pdf";
        //  console.log('dta nams '+$stateParams.dtaName);
      }

      if ($stateParams.PdfCollection == "SG") {
        // var SGName = $stateParams.PdfName.split('Comprehensive SARS Guide to Capital Gains Tax -')[1];
        // console.log('RGNName ' + RGNName);
        if (
          $stateParams.PdfName ==
          "SARS Comprehensive Guide to Capital Gains Tax (SGD001)"
        ) {
          $scope.pdfUrl =
            pdfFolderPath +
            "SGD/Comprehensive SARS Guide to Capital Gains Tax - SGD001.pdf";
        } else if (
          $stateParams.PdfName ==
          "SARS Comprehensive Guide to Dividends Tax (SGD002)"
        ) {
          $scope.pdfUrl =
            pdfFolderPath +
            "SGD/Comprehensive SARS Guide to Dividends Tax - SGD002.pdf";
        } else {
          var SDGName = $stateParams.PdfName.split("(")[1].split(")")[0];
          $scope.pdfUrl = pdfFolderPath + "SGD/" + SDGName + ".pdf";
        }

        //  console.log('dta nams '+$stateParams.dtaName);
      }

      $scope.printPdf = function () {
        //   if($cordovaPrinter.isAvailable()) {
        //     resolveLocalFileSystemURL($scope.pdfUrl, function(entry) {
        //     var nativePath = entry.toURL();
        //  console.log(`nativePath: ${nativePath}`)
        //  cordova.plugins.printer.print($scope.pdfUrl);
        //     })
        //   } else {
        //     alert("Printing is not available on device");
        //   }
        window.plugins.PrintPDF.print({
          data: $scope.pdfUrl,
          type: "File",
          title: "Print Document",
          success: function () {
            console.log("success");
          },
          error: function (data) {
            data = JSON.parse(data);
            console.log("failed: " + data.error);
          },
        });
      };

      $scope.emailPdf = async function () {
        let filePath = $scope.pdfUrl.split(
          "cdvfile://localhost/persistent/pdfs/"
        )[1];

        const fullFilePath = `file:///data/data/com.kmos.happe/files/files/pdfs/DTA/DTA_Algeria.pdf`;
        const attachmentsArray = [];

        console.log("social share clicked");
        console.log("fullFilePath", fullFilePath);
        // this is the complete list of currently supported params you can pass to the plugin (all optional)
        var options = {
          message: `Share ${$scope.title}`, // not supported on some apps (Facebook, Instagram)
          subject: `Sharing ${$scope.title}`, // fi. for email
          files: fullFilePath, // an array of filenames either locally or remotely
          url: "",
          chooserTitle: "Pick an app", // Android only, you can override the default share sheet title,
          appPackageName: "com.apple.social.facebook", // Android only, you can provide id of the App you want to share with
        };

        var onSuccess = function (result) {
          console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
          console.log("Shared to app: " + result.app); // On Android result.app since plugin version 5.4.0 this is no longer empty. On iOS it's empty when sharing is cancelled (result.completed=false)
        };

        var onError = function (msg) {
          console.log("Sharing failed with message: " + msg);
        };

        window.plugins.socialsharing.shareViaEmail(
          `Share ${$scope.title}`,
          `Share ${$scope.title}`,
          null,
          null,
          null,
          fullFilePath,
          onSuccess,
          onError
        );
      };

      $scope.addSectionToBriefcase = function () {
        $scope.sectionAdded = [];
        notesService.getBriefcases().then(function (data) {
          $scope.briefcases = data;
        });
        var alertPopup = $ionicPopup.alert({
          title: "Briefcases",
          templateUrl: "templates/briefcase-list.html",
          scope: $scope,
          okText: "Done",
        });

        alertPopup.then(function (res) {
          console.log("Thank you for not eating my delicious ice cream cone");
        });
        $scope.goToBriefcases = function () {
          var confirmPopup = $ionicPopup.confirm({
            title: "Create a Briefcase",
            template:
              "This will navigate you to the Briefcases section<br>Continue?",
          });

          confirmPopup.then(function (res) {
            if (res) {
              alertPopup.close();
              $scope.closePopover();

              $state.go("app.briefcasesIndex");
              console.log("You are sure");
            } else {
              console.log("You are not sure");
            }
          });
        };
      };
      $scope.putSectionInBriefcase = function (briefcaseID, index) {
        //check if section is already in briefcaseID
        notesService
          .checkIfSectionInBriefcase(
            briefcaseID,
            $stateParams.PdfID,
            $stateParams.PdfCollection,
            "other"
          )
          .then(function (data) {
            if (data.length > 0) {
              var alertPopup = $ionicPopup.alert({
                title: "This information is already added to your briefcase",
                template: "",
                scope: $scope,
                okText: "OK",
              });

              alertPopup.then(function (res) {
                console.log(
                  "Thank you for not eating my delicious ice cream cone"
                );
              });
            } else {
              notesService
                .putSectionInBriefcase(
                  briefcaseID,
                  $stateParams.PdfID,
                  $stateParams.PdfCollection,
                  "other"
                )
                .then(function (data) {
                  $scope.sectionAdded[index] = true;
                });
            }
          });
      };
    },
  ])
  .controller("taxTopicIndexCtrl", [
    "$scope",
    "$state",
    function ($scope, $state) {
      $scope.goToTaxTopicList = function (parentID, parentName) {
        $state.go("app.taxTopicList", {
          parentID: parentID,
          parentName: parentName,
        });
      };
    },
  ])
  .controller("taxTopicListCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "taxTopicService",
    function ($scope, $state, $stateParams, taxTopicService) {
      switch ($stateParams.parentName) {
        case "Tax topics":
          $scope.reactiveColor = {
            "background-color": "#7a55ab",
            color: "white",
          };
          break;
        case "VAT topics":
          $scope.reactiveColor = {
            "background-color": "#bdd6ee",
            color: "black",
          };
          break;
        default:
          $scope.reactiveColor = {
            "background-color": "#7a55ab",
            color: "white",
          };
      }
      $scope.taxTopicTitle = $stateParams.taxTopicTitle;
      $scope.parentName = $stateParams.parentName;

      taxTopicService
        .getTaxTopics($stateParams.parentName)
        .then(function (data) {
          $scope.taxTopics = data;
        });

      $scope.goToTaxTopic = function (termID, termName, parentName) {
        $state.go("app.taxTopic", {
          termID: termID,
          termName: termName,
          parentName: parentName,
        });
      };
    },
  ])
  .controller("taxTopicCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "taxTopicService",
    function ($scope, $state, $stateParams, taxTopicService) {
      switch ($stateParams.parentName) {
        case "Tax topics":
          $scope.reactiveColor = {
            "background-color": "#7a55ab",
            color: "white",
          };
          break;
        case "VAT topics":
          $scope.reactiveColor = {
            "background-color": "#bdd6ee",
            color: "black",
          };
          break;
        default:
          $scope.reactiveColor = {
            "background-color": "#7a55ab",
            color: "white",
          };
      }

      $scope.topicName = $stateParams.termName;
      $scope.taxTopicITAItems = [];
      console.log("topic name " + $stateParams.termName);
      console.log("topic ID " + $stateParams.termID);
      taxTopicService
        .getTaxTopicTAAItems($stateParams.termID)
        .then(function (data) {
          $scope.taxTopicTAAItems = data;
        });
      taxTopicService
        .getTaxTopicParagraphs($stateParams.termID)
        .then(function (data) {
          $scope.taxTopicParagraphs = data;
        });
      taxTopicService
        .getTaxTopicITAItems($stateParams.termID)
        .then(function (data) {
          /*  for (var i = 0; i < data.length; i++) {
    var addIfNotDefinition = function(dataItem){
    taxTopicService.definitionCheck(dataItem.ID).then(function(result){
    if (result.length == 0) {
    console.log('data i ' + JSON.stringify(dataItem));
    $scope.taxTopicITAItems.push(dataItem);
  }

});
}

addIfNotDefinition(data[i]);


}*/
          $scope.taxTopicITAItems = data;
        });

      taxTopicService
        .getTaxTopicVATItems($stateParams.termID)
        .then(function (data) {
          $scope.taxTopicVATItems = data;
        });
      taxTopicService
        .getTaxTopicCustomsItems($stateParams.termID)
        .then(function (data) {
          $scope.taxTopicCustomsItems = data;
        });
      taxTopicService
        .getTaxTopicEstateItems($stateParams.termID)
        .then(function (data) {
          $scope.taxTopicEstateItems = data;
        });
      taxTopicService
        .getTaxTopicTransferItems($stateParams.termID)
        .then(function (data) {
          $scope.taxTopicTransferItems = data;
        });
      taxTopicService.getOtherItems($stateParams.termID).then(function (data) {
        $scope.taxTopicOtherItems = data;
      });
      $scope.goToSection = function (postID, catID) {
        $state.go("app.taxActPost", { postID: postID, catID: catID });
      };
      $scope.goToOther = function (term_id, term_name, term_parent) {
        var term_collection = "";
        if (term_parent == 936) {
          term_collection = "DTA";
        }
        if (term_parent == 1010) {
          term_collection = "IN";
        }
        if (term_parent == 1011) {
          term_collection = "PN";
        }
        if (term_parent == 1917) {
          term_collection = "VATIN";
        }

        $state.go("app.showPdf", {
          PdfID: term_id,
          PdfName: term_name,
          PdfCollection: term_collection,
        });
      };
    },
  ])
  .controller("definitionsCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "definitionsService",
    "searchService",
    function ($scope, $state, $stateParams, definitionsService, searchService) {
      $scope.reactiveColor = { "background-color": "#000000", color: "white" };
      $scope.title = $stateParams.parentName;
      definitionsService
        .getDefinitions($stateParams.parentID)
        .then(function (data) {
          $scope.definitions = data;
          console.log("defs " + data);
        });
      $scope.goToDefinition = function (postID) {
        searchService.getCollectionFromPostID(postID).then(function (data) {
          $state.go("app.taxActPost", {
            postID: postID,
            catID: data.collection,
          });
        });
      };
    },
  ])
  .controller("UpdateDataCtrl", [
    "$scope",
    "$rootScope",
    "$state",
    "$stateParams",
    "updateService",
    "$ionicLoading",
    "$ionicPopup",
    "$ionicHistory",
    function (
      $scope,
      $rootScope,
      $state,
      $stateParams,
      updateService,
      $ionicLoading,
      $ionicPopup,
      $ionicHistory
    ) {
      $scope.$on("$ionicView.beforeEnter", function () {
        updateService.getEmailFromLocalDB().then(function (data) {
          if (data) {
            console.log("email " + JSON.stringify(data));
            $scope.emailRegistered = true;
          }
        });

        var dateLastUpdated = "";
        var newPosts = [];
        updateService.getLastUpdated().then(function (data) {
          updateService
            .getRemotePdfModifiedDate()
            .then(function (pdfRemoteDate) {
              $scope.updateTitle =
                "Last updated: " + data.date_modified + " (GMT)";
              $scope.dateLastUpdated = data.date_modified;
              $scope.remoteLastModifiedData =
                pdfRemoteDate.data[0].data_modified;

              if ($scope.remoteLastModifiedData > $scope.dateLastUpdated) {
                $scope.haveUpdates = "Updates are available";
                $rootScope.updatesAvailable = true;
              } else {
                $scope.haveUpdates = "No new updates are available";
                $rootScope.updatesAvailable = false;
              }

              console.log("have updates " + $scope.haveUpdates);
            });
        });

        updateService.getLastUpdatedPdf().then(function (result) {
          updateService
            .getRemotePdfModifiedDate()
            .then(function (pdfRemoteDate) {
              $scope.dateLastUpdatedPdf = "";
              if (result) {
                $scope.dateLastUpdatedPdf = result.date_modified;
              }
              $scope.remoteLastModifiedPdf = pdfRemoteDate.data[0].pdf_modified;

              if (
                !$scope.dateLastUpdatedPdf ||
                $scope.remoteLastModifiedPdf > $scope.dateLastUpdatedPdf
              ) {
                $rootScope.updatesAvailable = true;
                $scope.havePdfUpdates = "Tax information updates are available";
              } else {
                $scope.havePdfUpdates =
                  "No new tax information updates are available";
              }
            });
        });
      });

      $scope.updateEmail = function (userEmail) {
        var confirmPopup = $ionicPopup.confirm({
          title: "",
          template: "Confirm this is your e-mail: " + userEmail,
        });

        confirmPopup.then(function (res) {
          if (res) {
            updateService.postEmail("NA", userEmail).then(function () {
              $scope.emailPosted = true;
              $scope.emailRegistered = true;
              updateService.insertEmailIntoLocalDB(userEmail).then(function () {
                console.log("email inserted");
              });
            });
            console.log("You are sure");
          } else {
            console.log("You are not sure");
          }
        });
      };

      $scope.diagnose = function () {
        updateService.getLocalDBTermRel().then(function (data) {
          console.log("Data: " + JSON.stringify(data));
        });
      };

      $scope.testBulkImport = function () {
        var promises = [];
        $ionicLoading.show({
          template:
            "<ion-spinner></ion-spinner> <br/> Please wait, the database is being updated.<br> The update may take a few minutes... <br> Please do not close the App until the update is completed.",
        });
        updateService
          .getTermRelationships()
          .then(function (termRelationshipsResponse) {
            console.log(
              "remote term taxonomy " +
                JSON.stringify(termRelationshipsResponse)
            );
            updateService.deleteTermRelationships().then(function () {
              updateService.insertResultsIntoDB(
                termRelationshipsResponse.data,
                "term_relationships"
              );
            });
          });
        Promise.all(promises)
          .then(function () {
            //$ionicLoading.hide();
          })
          .catch((e) => {
            // handle errors here
          });
      };
      $scope.downloaderInitialized = false;
      $scope.downloaderSuccess = false;
      $scope.downloaderProgress = 0;
      $scope.downloadTest = function () {
        if (window.Connection) {
          if (navigator.connection.type == Connection.NONE) {
            alert(
              "There is no internet connection on your device. Can't update"
            );
            return;
          }
        }
        $ionicLoading.show({
          template:
            '<ion-spinner></ion-spinner> <br/> Please wait, the database is being updated.<br> The update may take a few minutes... <br> Please do not close the App until the update is completed.<br>Download progress:<br><progress id="progress-bar-pdf" max="100" value="0"><span>0</span>%</progress><br><br>Unzip progress:<br><progress id="unzip-bar-pdf" max="100" value="0"><span>0</span>%</progress>',
        });

        //document.getElementById("downloader-progress").innerHTML = 'Download progress <span id="downloader-percentage"></span>%<br>';

        downloader.init({ folder: "pdfs", unzip: true });
        updateService.getPdfFileUrl().then(function (data) {
          console.log("pdfurl" + data.data[0].pdfUrl);
          downloader.get(data.data[0].pdfUrl);
        });

        document.addEventListener("DOWNLOADER_initialized", function (event) {
          var data = event.data;
          console.log("DOWNLOADER_initialized " + data);
        });
        document.addEventListener(
          "DOWNLOADER_downloadSuccess",
          function (event) {
            var data = event.data;
            console.log("DOWNLOADER_downloadSuccess " + JSON.stringify(data));
          }
        );
        document.addEventListener(
          "DOWNLOADER_downloadProgress",
          function (event) {
            //document.getElementById("downloader-progress").innerHTML = 'Download progress <span id="downloader-percentage"></span>%<br>';
            var progress = document.getElementById("progress-bar-pdf");
            var data = event.data;
            console.log("DOWNLOADER_downloadProgress " + JSON.stringify(data));
            progress.value = data[0];
            progress.getElementsByTagName("span")[0].innerHTML = Math.floor(
              progress.value
            );
          }
        );
        document.addEventListener("DOWNLOADER_unzipProgress", function (event) {
          var progress = document.getElementById("unzip-bar-pdf");
          var data = event.data;
          console.log("DOWNLOADER_downloadProgress " + JSON.stringify(data));
          progress.value = data[0];
          progress.getElementsByTagName("span")[0].innerHTML = Math.floor(
            progress.value
          );
        });
        document.addEventListener(
          "DOWNLOADER_unzipSuccess",
          function (event, $scope) {
            var data = event.data;
            console.log("DOWNLOADER_unzipSuccess " + JSON.stringify(data));
            //document.getElementById("download-complete").innerHTML = 'Download complete';
            $ionicLoading.hide();
            updateService.getLastUpdatedPdf().then(function (data) {
              if (!data) {
                updateService.insertLastUpdatedPdf().then(function () {
                  console.log("pdf mod date inserted");
                });
              } else {
                updateService.updateLastUpdatedPdf().then(function () {
                  console.log("pdf mod date updated");
                });
              }
              document.getElementById("have-pdf-updates").innerHTML =
                "<b>You are up to date!</b>";
              console.log("updata  " + JSON.stringify(data));
            });
          }
        );

        //   function displayImageByFileURL(fileEntry,fileURL) {
        //     var elem = document.getElementById('imageElement');
        //     elem.src = fileEntry.toURL();
        // }

        // var uri = 'http://k-mos.com/wp-content/uploads/2019/01/logo.png';
        //       var fileTransfer = new FileTransfer();
        //       var fileURL = 'cdvfile://localhost/persistent/path/to/file1.png';

        //       fileTransfer.download(
        //           uri,
        //           fileURL,
        //           function (entry) {
        //               console.log("Successful download...");
        //               console.log("download complete: " + entry.toURL());

        //                 // Or just display it.
        //                 displayImageByFileURL(entry,fileURL);

        //           },
        //           function (error) {
        //               console.log("download error source " + error.source);
        //               console.log("download error target " + error.target);
        //               console.log("upload error code" + error.code);
        //           },
        //           null, // or, pass false
        //           {
        //               //headers: {
        //               //    "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
        //               //}
        //           }
        //       );

        console.log("download test");
      };

      $scope.getUpdates = function () {
        if (window.Connection) {
          if (navigator.connection.type == Connection.NONE) {
            alert(
              "There is no internet connection on your device. Can't update"
            );
            return;
          }
        }
        $ionicLoading.show({
          template:
            '<ion-spinner></ion-spinner> <br/> Please wait, the database is being updated.<br> The update may take a few minutes... <br> Please do not close the App until the update is completed.<br><progress id="progress-bar" max="100" value="0"><span>0</span>%</progress>',
        });

        var promises = [];
        updateService.getAmmendments().then(function (ammendmentResponse) {
          //console.log('remote terms ' + JSON.stringify(response));
          updateService.deleteAmmendments().then(function () {
            updateService.insertResultsIntoDB(
              ammendmentResponse.data,
              "ammendments"
            );
            updateService.getTerms().then(function (termsResponse) {
              //console.log('remote terms ' + JSON.stringify(response));
              updateService.deleteTerms().then(function () {
                updateService.insertResultsIntoDB(termsResponse.data, "terms");
                updateService
                  .getTermTaxonomy()
                  .then(function (termTaxonomyResponse) {
                    //console.log('remote term taxonomy ' + JSON.stringify(termTaxonomyResponse));
                    updateService.deleteTermTaxonomy().then(function () {
                      updateService.insertResultsIntoDB(
                        termTaxonomyResponse.data,
                        "term_taxonomy"
                      );
                      updateService
                        .getTermRelationships()
                        .then(function (termRelationshipsResponse) {
                          console.log(
                            "remote term taxonomy " +
                              JSON.stringify(termRelationshipsResponse)
                          );
                          updateService
                            .deleteTermRelationships()
                            .then(function () {
                              updateService.insertResultsIntoDB(
                                termRelationshipsResponse.data,
                                "term_relationships"
                              );

                              updateService
                                .getPostsLocalDB()
                                .then(function (localDBPosts) {
                                  //console.log('local db post ids '+ JSON.stringify(localDBPosts));
                                  updateService
                                    .getLastUpdated()
                                    .then(function (resp) {
                                      //console.log('date last updated: '+JSON.stringify(resp));

                                      updateService
                                        .getPosts(resp.date_modified)
                                        .then(function (postsResponse) {
                                          //console.log('title of number 1 '+ response.data[0].post_title);
                                          //console.log('total pages '+response.headers("X-WP-TotalPages"));

                                          //console.log('Data length: '+ response.data.length);
                                          //console.log('date updated test '+$scope.dateLastUpdated);

                                          //EDIT 11-11-18
                                          updateService
                                            .getVATPosts(resp.date_modified)
                                            .then(function (vatPostsResponse) {
                                              var combinedPosts =
                                                postsResponse.data.concat(
                                                  vatPostsResponse.data
                                                );
                                              var deletedPosts =
                                                updateService.getDeletedPosts(
                                                  localDBPosts,
                                                  combinedPosts
                                                );
                                              //  console.log('deletedPosts '+JSON.stringify(deletedPosts));
                                              for (
                                                var i = 0;
                                                i < deletedPosts.length;
                                                i++
                                              ) {
                                                promises.push(
                                                  updateService.deletePost(
                                                    deletedPosts[i]
                                                  )
                                                );
                                              }
                                              //console.log('title of number 1 '+ response.data[0].post_title);
                                              //console.log('total pages '+response.headers("X-WP-TotalPages"));

                                              //console.log('Data length: '+ response.data.length);
                                              //console.log('date updated test '+$scope.dateLastUpdated);
                                              updateService.updatePosts(
                                                postsResponse.data,
                                                localDBPosts,
                                                $scope.dateLastUpdated
                                              );
                                              updateService
                                                .updatePostsVAT(
                                                  vatPostsResponse.data,
                                                  localDBPosts,
                                                  $scope.dateLastUpdated
                                                )
                                                .then(function () {
                                                  console.log("resolved");
                                                  $scope.downloadTest();
                                                });
                                              //end edit

                                              Promise.all(promises)
                                                .then(function () {
                                                  updateService
                                                    .updateLastUpdated()
                                                    .then(function () {
                                                      updateService
                                                        .getLastUpdated()
                                                        .then(function (data) {
                                                          $scope.updateTitle =
                                                            "Last updated: " +
                                                            data.date_modified;
                                                          $scope.dateLastUpdated =
                                                            data.date_modified;
                                                          $scope.haveUpdates =
                                                            "You are up to date!";
                                                          $rootScope.updatesAvailable = false;
                                                          $ionicHistory.clearCache();
                                                        });
                                                    });
                                                })
                                                .catch((e) => {
                                                  // handle errors here
                                                });

                                              //EDIT 11-11-18
                                            });
                                          //End edit
                                        });
                                    });
                                });
                            });
                        });
                    });
                  });
              });
            });
          });
        });
      };

      $scope.getRecord = function () {
        updateService.getRecord().then(function (data) {
          console.log("post id for id 10 " + data.post_id);
        });
      };
    },
  ])
  .controller("OTLCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "modalService",
    "$ionicPopup",
    "DTAService",
    function (
      $scope,
      $state,
      $stateParams,
      modalService,
      $ionicPopup,
      DTAService
    ) {
      $scope.reactiveColor = { "background-color": "#6ce2ee" };

      $scope.goToOTL = function (OTLID, OTLName) {
        $state.go("app.showPdf", {
          PdfID: OTLID,
          PdfName: OTLName,
          PdfCollection: "OTL",
        });
      };
      DTAService.getOTLs().then(function (data) {
        $scope.OTLs = data;
      });
    },
  ])
  .controller("CustomsCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "modalService",
    "$ionicPopup",
    "DTAService",
    function (
      $scope,
      $state,
      $stateParams,
      modalService,
      $ionicPopup,
      DTAService
    ) {
      $scope.reactiveColor = { "background-color": "#806000", color: "white" };

      $scope.goToCustomsAct = function () {
        $state.go("app.taxActPost", { postID: 14168, catID: 1627 });
      };

      $scope.goToCustomsRules = function () {
        $state.go("app.showPdf", {
          PdfID: "",
          PdfName: "Customs_&_Excise_Rules",
          PdfCollection: "other",
        });
      };
    },
  ])
  .controller("VATCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "modalService",
    "$ionicPopup",
    "DTAService",
    function (
      $scope,
      $state,
      $stateParams,
      modalService,
      $ionicPopup,
      DTAService
    ) {
      $scope.reactiveColor = { "background-color": "#bdd6ee" };

      $scope.goToVATAct = function () {
        $state.go("app.taxActPost", { postID: 13291, catID: 1525 });
      };

      $scope.goToVATRegulations = function () {
        $state.go("app.VATRegulationsList");
      };

      $scope.goToRGN = function (RGNID, RGNName) {
        $state.go("app.showPdf", {
          PdfID: RGNID,
          PdfName: RGNName,
          PdfCollection: "RGN",
        });
      };

      $scope.doubleTap = function () {
        console.log("double tap baby!");
      };
      $scope.singleTap = function () {
        console.log("single tap yo!");
      };
      DTAService.getRGNs().then(function (data) {
        $scope.RGNs = data;
        console.log("RGNS: " + JSON.stringify(data));
      });
    },
  ]);
