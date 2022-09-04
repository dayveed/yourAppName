angular
  .module("kmos4.directives", [])

  .directive("a", function () {
    return {
      restrict: "E",
      link: function (scope, elem, attrs) {
        elem.on("click", function (e) {
          console.log("Anchor stopped ");
          e.preventDefault();
        });
      },
    };
  })
  .directive("onFinishRender", function ($timeout) {
    return {
      restrict: "A",
      link: function (scope, element, attr) {
        if (scope.$last === true) {
          $timeout(function () {
            scope.$emit(attr.onFinishRender);
          });
        }
      },
    };
  });
