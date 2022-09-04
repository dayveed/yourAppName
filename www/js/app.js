var db = null;
angular
  .module("kmos4", [
    "ionic",
    "ngCordova",
    "angular-cache",
    "kmos4.controllers",
    "kmos4.services",
    "kmos4.filters",
    "kmos4.directives",
    "angular-bind-html-compile",
    "pdf",
  ])

  .run(function ($ionicPlatform, $cordovaSQLite, $state) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)

      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
      /*window.plugins.sqlDB.copy("kmos-2.db",0, function() {
        db = $cordovaSQLite.openDB("kmos-2.db");
     }, function(error) {
         console.error("There was an error copying the database: " + error);
         db = $cordovaSQLite.openDB({name: "kmos-2.db",location:'default'});
     });*/
      db = window.sqlitePlugin.openDatabase({
        name: "kmos-02_08_18.db",
        location: "default",
        createFromLocation: 1,
      });
      var query = "SELECT name FROM sqlite_master WHERE type='table';";
      $cordovaSQLite.execute(db, query).then(
        function (res) {
          if (res.rows.length > 0) {
            console.log("Table name -> " + res.rows.item(0).name);
            //return res.rows.item(0);
          } else {
            console.log("No results found");
          }
        },
        function (err) {
          console.error("post error " + err);
        }
      );
    });
    $ionicPlatform.registerBackButtonAction(function (event) {
      if ($state.current.name == "app.home") {
        navigator.app.exitApp(); //<-- remove this line to disable the exit
      } else {
        navigator.app.backHistory();
      }
    }, 100);
  })

  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state("app", {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu.html",
        controller: "AppCtrl",
      })

      .state("app.welcome", {
        url: "/welcome/",
        views: {
          menuContent: {
            templateUrl: "templates/welcome.html",
            controller: "",
          },
        },
      })
      .state("app.subscriptions", {
        url: "/subscriptions/",
        views: {
          menuContent: {
            templateUrl: "templates/subscriptions.html",
            controller: "",
          },
        },
      })
      .state("app.welcomeIncome", {
        url: "/welcome-income/",
        views: {
          menuContent: {
            templateUrl: "templates/welcome-income.html",
            controller: "",
          },
        },
      })
      .state("app.welcomeVAT", {
        url: "/welcome-vat/",
        views: {
          menuContent: {
            templateUrl: "templates/welcome-vat.html",
            controller: "",
          },
        },
      })
      .state("app.welcomeFull", {
        url: "/welcome-full/",
        views: {
          menuContent: {
            templateUrl: "templates/welcome-full.html",
            controller: "",
          },
        },
      })
      .state("app.welcomeCorporate", {
        url: "/welcome-corporate/",
        views: {
          menuContent: {
            templateUrl: "templates/welcome-corporate.html",
            controller: "",
          },
        },
      })
      .state("app.contact", {
        url: "/contact/",
        views: {
          menuContent: {
            templateUrl: "templates/contact.html",
            controller: "",
          },
        },
      })
      .state("app.highlighter", {
        params: {
          postContent: "",
          termID: 0,
        },
        url: "/highlighter/",
        views: {
          menuContent: {
            templateUrl: "templates/highlighter.html",
            controller: "highlighterCtrl",
          },
        },
      })
      .state("app.post", {
        url: "/post/:postID?catID",
        views: {
          menuContent: {
            templateUrl: "templates/tax-post.html",
            controller: "taxPostCtrl",
          },
        },
      })
      .state("app.taxActFull", {
        //cache: false,
        params: {
          postID: 17,
          catID: 597,
        },
        views: {
          menuContent: {
            templateUrl: "templates/tax-act-full.html",
            controller: "taxActFullCtrl",
          },
        },
      })
      .state("app.taxActPost", {
        url: "/taxActPost/",
        params: {
          postID: 17,
          catID: 597,
          searchTerm: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/tax-act-post.html",
            controller: "taxActPostCtrl",
          },
        },
      })

      .state("app.taxActIndex", {
        url: "/tax-act-index/:parentCatID",
        views: {
          menuContent: {
            templateUrl: "templates/tax-act-index.html",
            controller: "taxActIndexCtrl",
          },
        },
      })
      .state("app.taxTopicsIndex", {
        url: "/tax-topic-index/",
        views: {
          menuContent: {
            templateUrl: "templates/tax-topic-index.html",
            controller: "taxTopicIndexCtrl",
          },
        },
      })
      .state("app.taxTopicList", {
        url: "/tax-topic-list/:parentName",
        params: {
          parentID: 0,
          parentName: "",
          taxTopicTitle: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/tax-topic-list.html",
            controller: "taxTopicListCtrl",
          },
        },
      })
      .state("app.taxTopic", {
        url: "/tax-topic/",
        params: {
          termID: 0,
          termName: "",
          parentName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/tax-topic.html",
            controller: "taxTopicCtrl",
          },
        },
      })
      .state("app.taxPostsIndex", {
        url: "/tax-post-index/:catID",
        views: {
          menuContent: {
            templateUrl: "templates/tax-posts-index.html",
            controller: "taxPostsIndexCtrl",
          },
        },
      })
      .state("app.briefcasesIndex", {
        cache: false,
        url: "/briefcases-index/",
        views: {
          menuContent: {
            templateUrl: "templates/briefcases-index.html",
            controller: "BriefcaseCtrl",
          },
        },
      })
      .state("app.briefcase", {
        cache: false,
        url: "/briefcase/",
        params: {
          briefcaseID: 0,
          briefcaseName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/briefcase.html",
            controller: "BriefcaseCtrl",
          },
        },
      })
      .state("app.showPdf", {
        cache: false,
        url: "/show-pdf/",
        params: {
          PdfID: 0,
          PdfName: "",
          PdfCollection: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/pdfs.html",
            controller: "showPdfCtrl",
          },
        },
      })
      .state("app.DTAList", {
        url: "/DTA-list/:parentID",
        params: {
          parentID: 0,
          parentName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/dta-list.html",
            controller: "DTAIndexCtrl",
          },
        },
      })
      .state("app.DTAIndex", {
        url: "/DTA-index/:parentID",
        params: {
          parentID: 0,
          parentName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/dta-index.html",
            controller: "DTAIndexCtrl",
          },
        },
      })
      .state("app.defintionsIndex", {
        url: "/definitions-index/:parentID",
        params: {
          parentID: 0,
          parentName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/definitions-index.html",
            controller: "definitionsCtrl",
          },
        },
      })
      .state("app.moreLawIndex", {
        url: "/more-law-index/:parentID",
        params: {
          parentID: 0,
          parentName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/more-law-index.html",
            controller: "definitionsCtrl",
          },
        },
      })
      .state("app.SARSIndex", {
        url: "/SARS-index/:parentID",
        params: {
          parentID: 0,
          parentName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/SARS-index.html",
            controller: "SARSIndexCtrl",
          },
        },
      })
      .state("app.SARSINList", {
        url: "/SARS-IN-List/:parentID",
        params: {
          parentID: 1010,
          parentName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/SARS-IN-list.html",
            controller: "SARSINListCtrl",
          },
        },
      })

      .state("app.SARSPNList", {
        url: "/SARS-PN-List/:parentID",
        params: {
          parentID: 1011,
          parentName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/SARS-PN-list.html",
            controller: "SARSPNListCtrl",
          },
        },
      })
      .state("app.SARSVATINList", {
        url: "/SARS-VATIN-List/:parentID",
        params: {
          parentID: 1917,
          parentName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/SARS-VATIN-list.html",
            controller: "SARSVATINListCtrl",
          },
        },
      })
      .state("app.PRIndex", {
        url: "/PR-index/:parentID",
        params: {
          parentID: 0,
          parentName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/PR-index.html",
            controller: "PRIndexCtrl",
          },
        },
      })
      .state("app.PRBCRList", {
        url: "/PR-BCR-List/:parentID",
        params: {
          parentID: 2032,
          parentName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/PR-BCR-list.html",
            controller: "PRBCRListCtrl",
          },
        },
      })
      .state("app.PRBGRList", {
        url: "/PR-BGR-List/:parentID",
        params: {
          parentID: 2033,
          parentName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/PR-BGR-list.html",
            controller: "PRBGRListCtrl",
          },
        },
      })
      .state("app.PRBPRList", {
        url: "/PR-BPR-List/:parentID",
        params: {
          parentID: 2034,
          parentName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/PR-BPR-list.html",
            controller: "PRBPRListCtrl",
          },
        },
      })
      .state("app.definitions", {
        url: "/definitions/:parentID",
        params: {
          parentID: 0,
          collectionID: 0,
          parentName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/definitions.html",
            controller: "definitionsCtrl",
          },
        },
      })
      .state("app.updateData", {
        cache: false,
        url: "/updateData",
        params: {},
        views: {
          menuContent: {
            templateUrl: "templates/update-data.html",
            controller: "UpdateDataCtrl",
          },
        },
      })
      .state("app.OTList", {
        url: "/OTL-list/:parentID",
        params: {
          parentID: 0,
          parentName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/OTL-list.html",
            controller: "OTLCtrl",
          },
        },
      })
      .state("app.customsIndex", {
        url: "/customs-index/:parentID",
        params: {
          parentID: 0,
          parentName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/customs-index.html",
            controller: "CustomsCtrl",
          },
        },
      })
      .state("app.VATIndex", {
        url: "/VAT-index/:parentID",
        params: {
          parentID: 0,
          parentName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/VAT-index.html",
            controller: "VATCtrl",
          },
        },
      })
      .state("app.VATRegulationsList", {
        url: "/VAT-regulations-list/:parentID",
        params: {
          parentID: 0,
          parentName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/VAT-regulations-list.html",
            controller: "VATCtrl",
          },
        },
      })
      .state("app.SARSSGList", {
        url: "/Sars-guides",
        params: {
          parentID: 0,
          parentName: "",
        },
        views: {
          menuContent: {
            templateUrl: "templates/SARS-SG-list.html",
            controller: "SARSSGListCtrl",
          },
        },
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise("/app/welcome/");
  });
