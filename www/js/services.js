angular
  .module("kmos4.services", [])

  .factory("encodeURIService", function () {
    return {
      encode: function (string) {
        console.log(string);
        return encodeURIComponent(string)
          .replace(/\"/g, "%22")
          .replace(/\ /g, "%20")
          .replace(/[!'()]/g, escape);
      },
    };
  })

  .service("modalService", function ($ionicModal) {
    this.openModal = function (id, currentLocation = null) {
      var _this = this;

      if (id == 1) {
        _this.currentLocation = currentLocation;
        $ionicModal
          .fromTemplateUrl("templates/search.html", {
            scope: null,
            controller: "SearchCtrl",
          })
          .then(function (modal) {
            _this.modal = modal;
            _this.modal.show();
          });
      } else if (id == 2) {
        $ionicModal
          .fromTemplateUrl("templates/login.html", {
            scope: null,
            controller: "LoginSignupCtrl",
          })
          .then(function (modal) {
            _this.modal = modal;
            _this.modal.show();
          });
      } else if (id == 3) {
        $ionicModal
          .fromTemplateUrl("templates/signup.html", {
            scope: null,
            controller: "LoginSignupCtrl",
          })
          .then(function (modal) {
            _this.modal = modal;
            _this.modal.show();
          });
      } else if (id == 4) {
        $ionicModal
          .fromTemplateUrl("templates/drawing.html", {
            scope: null,
            controller: "drawingCtrl",
          })
          .then(function (modal) {
            _this.modal = modal;
            _this.modal.show();
          });
      }
    };

    this.closeModal = function () {
      var _this = this;
      if (!_this.modal) {
        return;
      }
      _this.modal.hide();
      _this.modal.remove();
    };
  })

  .factory("dateService", function ($filter) {
    var currentDate = function () {
      var d = new Date();
      var date = $filter("date")(d, "yyyy-MM-dd");
      return date;
    };
    var oneYearAgoDate = function () {
      var d = new Date(new Date().setDate(new Date().getDate() - 365));
      var date = $filter("date")(d, "yyyy-MM-dd");
      return date;
    };
    var currentDateFull = function () {
      var d = new Date();
      var date = $filter("date")(d, "yyyy-MM-dd HH:mm:ss", "GMT");
      return date;
    };
    return {
      currentDate: currentDate,
      currentDateFull: currentDateFull,
      oneYearAgoDate: oneYearAgoDate,
    };
  })

  .factory("notesCacheService", function (CacheFactory) {
    var notesCache;

    if (!CacheFactory.get("notesCache")) {
      notesCache = CacheFactory("notesCache", {
        storageMode: "localStorage",
      });
    } else {
      notesCache = CacheFactory("notesCache");
    }
    return notesCache;
  })
  .factory("fontCacheService", function (CacheFactory) {
    var fontCache;

    if (!CacheFactory.get("fontCache")) {
      fontCache = CacheFactory("fontCache", {
        storageMode: "localStorage",
      });
    } else {
      fontCache = CacheFactory("fontCache");
    }
    return fontCache;
  })
  .factory("searchCacheService", function (CacheFactory) {
    var searchCache;

    if (!CacheFactory.get("searchCache")) {
      searchCache = CacheFactory("searchCache", {
        storageMode: "localStorage",
      });
    } else {
      searchCache = CacheFactory("searchCache");
    }
    return searchCache;
  })

  .factory("notesService", function (notesCacheService, DBA) {
    var self = this;
    self.addNote = function (section, note, type) {
      var text = note.body;
      if (type != "drawing") {
        text = text.replace(/\r?\n/g, "<br />");
      }
      var parameters = [text, type, note.title, note.date, section];
      return DBA.query(
        "INSERT INTO notes (content,type,title,date_added,section) VALUES (?,?,?,?,?)",
        parameters
      );
    };
    self.updateNote = function (note) {
      var text = note.body;
      text = text.replace(/\r?\n/g, "<br />");
      var parameters = [note.title, text, note.id];
      return DBA.query(
        "UPDATE notes SET title = (?), content = (?)  WHERE id = (?)",
        parameters
      );
    };

    self.getNotes = function (termID) {
      var parameters = [termID];
      return DBA.query(
        "SELECT id,title,section,content from notes where section = (?)",
        parameters
      ).then(function (result) {
        //console.log('Result '+JSON.stringify(DBA.getAll(result)));
        return DBA.getAll(result);
      });
    };
    self.getDrawings = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT id,title,section,content from notes where section = (?) AND type ='drawing' ",
        parameters
      ).then(function (result) {
        //console.log('Result '+JSON.stringify(DBA.getAll(result)));
        return DBA.getAll(result);
      });
    };

    self.getBriefcases = function () {
      return DBA.query(
        "SELECT id,name,date_modified from briefcases order by date_modified desc"
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.checkIfSectionInBriefcase = function (
      briefcaseID,
      sectionID,
      collectionID,
      sectionType
    ) {
      if (sectionType == "category") {
        item_type = "section," + collectionID;
      }
      if (sectionType == "post") {
        item_type = "post," + collectionID;
      }
      if (sectionType == "other") {
        item_type = "other," + collectionID;
      }
      if (sectionType == "definition") {
        item_type = "definition," + collectionID;
      }
      var parameters = [sectionID, item_type, briefcaseID];
      return DBA.query(
        "select item_id,item_type from briefcase_rel where item_id = (?) AND item_type = (?) AND briefcase_id = (?) ",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.putSectionInBriefcase = function (
      briefcaseID,
      sectionID,
      collectionID,
      sectionType
    ) {
      var item_type = "";
      if (sectionType == "category") {
        item_type = "section," + collectionID;
      }
      if (sectionType == "post") {
        item_type = "post," + collectionID;
      }
      if (sectionType == "other") {
        item_type = "other," + collectionID;
      }
      if (sectionType == "definition") {
        item_type = "definition," + collectionID;
      }
      console.log("item type: " + item_type);
      var parameters = [sectionID, item_type, briefcaseID];
      return DBA.query(
        "INSERT INTO briefcase_rel (item_id,item_type,briefcase_id) VALUES (?,?,?)",
        parameters
      );
    };
    self.removeNote = function (noteID) {
      var parameters = [noteID];
      return DBA.query("DELETE FROM notes WHERE id = (?)", parameters);
    };

    self.getTermPostsContent = function (termPosts) {
      var termPostsContent = "";
      for (var i = 0; i < termPosts.length; i++) {
        termPostsContent = termPostsContent + termPosts[i].post_content;
      }
      return termPostsContent;
    };

    self.getPostContentByID = function (posts, postID) {
      var postContent = "";

      for (var i = 0; i < posts.length; i++) {
        if (posts[i].ID == postID) {
          postContent = posts[i].post_content;
        }
      }
      return postContent;
    };

    return self;
  })

  .factory("fontService", function (fontCacheService) {
    var self = this;
    self.getFontAttr = function (attr) {
      return fontCacheService.get(attr);
    };
    self.putFontAttr = function (attr, value) {
      fontCacheService.put(attr, value);
    };
    self.updateFontSize = "";

    self.increaseFontSize = function () {
      var currentFontSize = fontCacheService.get("fontSize");
      if (currentFontSize < 18) {
        var fontSize = currentFontSize + 2 + "px";
        var lineHeight = fontSize * 1.42 + "px";
        fontCacheService.put("fontSize", currentFontSize + 2);
      }
    };
    self.setFontSize = function (size) {
      fontCacheService.put("fontSize", size);
    };

    self.decreaseFontSize = function () {
      var currentFontSize = fontCacheService.get("fontSize");
      if (currentFontSize > 14) {
        var fontSize = currentFontSize - 2 + "px";
        var lineHeight = fontSize * 1.42 + "px";
        fontCacheService.put("fontSize", currentFontSize - 2);
      }
    };

    self.getHangingIndent = function () {
      var currentFontSize = fontCacheService.get("fontSize");
      if (currentFontSize == 11) {
        return "hangingIndent-3";
      }
      if (currentFontSize == 14) {
        return "hangingIndent";
      }
      if (currentFontSize == 16) {
        return "hangingIndent-1";
      }
      if (currentFontSize == 18) {
        return "hangingIndent-2";
      }
    };

    return self;
  })
  .factory("briefcaseService", function (DBA, dateService) {
    var self = this;

    self.getBriefcases = function () {
      return DBA.query(
        "SELECT id,name,date_modified from briefcases order by date_modified desc"
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getFirstPostIDFromSectionID = function (sectionID) {
      var parameters = [sectionID];
      return DBA.query(
        "SELECT object_id,collection_order from term_relationships left join posts on object_id = ID  where term_taxonomy_id = (?) order by collection_order ASC",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };

    self.createNewBriefcase = function (name, length) {
      var currentDate = dateService.currentDate();
      var id = length + 1;
      var parameters = [name, currentDate, currentDate];
      return DBA.query(
        "INSERT INTO briefcases (name,date_added,date_modified) VALUES (?,?,?)",
        parameters
      );
    };
    self.addNote = function (note) {
      var text = note.content;
      var type = "note";
      var section = 0;
      text = text.replace(/\r?\n/g, "<br />");

      var parameters = [text, type, note.title, note.date, section];
      return DBA.query(
        "INSERT INTO notes (content,type,title,date_added,section) VALUES (?,?,?,?,?)",
        parameters
      );
    };

    self.addNoteToBriefcase = function (noteID, briefcaseID) {
      var type = "note";
      var parameters = [noteID, type, briefcaseID];
      return DBA.query(
        "INSERT INTO briefcase_rel (item_id,item_type,briefcase_id) VALUES (?,?,?)",
        parameters
      );
    };
    self.addSectionToBriefcase = function (sectionID, briefcaseID) {
      var type = "section";
      var parameters = [sectionID, type, briefcaseID];
      return DBA.query(
        "INSERT INTO briefcase_rel (item_id,item_type,briefcase_id) VALUES (?,?,?)",
        parameters
      );
    };
    self.addDrawingToBriefcase = function (drawingID, briefcaseID) {
      var type = "drawing";
      var parameters = [drawingID, type, briefcaseID];
      return DBA.query(
        "INSERT INTO briefcase_rel (item_id,item_type,briefcase_id) VALUES (?,?,?)",
        parameters
      );
    };
    self.deleteItemFromBriefcase = function (itemID) {
      var parameters = [itemID];
      return DBA.query(
        "delete from briefcase_rel where item_id = (?)",
        parameters
      );
    };
    self.updateBriefcase = function (briefcaseID, briefcaseName) {
      var parameters = [briefcaseName, briefcaseID];
      return DBA.query(
        "UPDATE briefcases SET name = (?) WHERE id = (?)",
        parameters
      );
    };
    self.deleteBriefcase = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query("delete from briefcases where id = (?)", parameters);
    };
    self.clearBriefcases = function () {
      return DBA.query("delete from briefcases");
    };
    self.getITASections = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT item_id,item_type,name from briefcase_rel LEFT JOIN terms ON item_id = term_id where item_type like '%section%' AND item_type like '%597%'  AND  name NOT LIKE '%Paragraph%' AND name NOT LIKE '%Schedule%'  AND briefcase_id = (?)",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getParagraphs = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT item_id,item_type,name from briefcase_rel LEFT JOIN terms ON item_id = term_id where item_type like '%section%' AND item_type like '%597%' AND (name LIKE '%Paragraph%' OR name LIKE '%Schedule%')  AND briefcase_id = (?)",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getTAASections = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT item_id,item_type,name from briefcase_rel LEFT JOIN terms ON item_id = term_id where item_type like '%section%' AND item_type like '%598%' AND briefcase_id = (?)",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };

    self.getVATASections = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT item_id,item_type,name from briefcase_rel LEFT JOIN terms ON item_id = term_id where item_type like '%section%' AND item_type like '%1525%' AND briefcase_id = (?)",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };

    self.getCEASections = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT item_id,item_type,name from briefcase_rel LEFT JOIN terms ON item_id = term_id where item_type like '%section%' AND item_type like '%1627%' AND briefcase_id = (?)",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };

    self.getEDASections = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT item_id,item_type,name from briefcase_rel LEFT JOIN terms ON item_id = term_id where item_type like '%section%' AND item_type like '%1846%' AND briefcase_id = (?)",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };

    self.getTDASections = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT item_id,item_type,name from briefcase_rel LEFT JOIN terms ON item_id = term_id where item_type like '%section%' AND item_type like '%1876%' AND briefcase_id = (?)",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };

    self.getSTTASections = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT item_id,item_type,name from briefcase_rel LEFT JOIN terms ON item_id = term_id where item_type like '%section%' AND item_type like '%1899%' AND briefcase_id = (?)",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };

    self.getMPRASections = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT item_id,item_type,name from briefcase_rel LEFT JOIN terms ON item_id = term_id where item_type like '%section%' AND item_type like '%2551%' AND briefcase_id = (?)",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getMPRAASections = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT item_id,item_type,name from briefcase_rel LEFT JOIN terms ON item_id = term_id where item_type like '%section%' AND item_type like '%2575%' AND briefcase_id = (?)",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getETISections = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT item_id,item_type,name from briefcase_rel LEFT JOIN terms ON item_id = term_id where item_type like '%section%' AND item_type like '%2640%' AND briefcase_id = (?)",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getCTASections = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT item_id,item_type,name from briefcase_rel LEFT JOIN terms ON item_id = term_id where item_type like '%section%' AND item_type like '%2604%' AND briefcase_id = (?)",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getSTTAASections = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT item_id,item_type,name from briefcase_rel LEFT JOIN terms ON item_id = term_id where item_type like '%section%' AND item_type like '%2678%' AND briefcase_id = (?)",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getUIFSections = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT item_id,item_type,name from briefcase_rel LEFT JOIN terms ON item_id = term_id where item_type like '%section%' AND item_type like '%2658%' AND briefcase_id = (?)",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getSDLSections = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT item_id,item_type,name from briefcase_rel LEFT JOIN terms ON item_id = term_id where item_type like '%section%' AND item_type like '%2719%' AND briefcase_id = (?)",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getOther = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT item_id,item_type,name from briefcase_rel LEFT JOIN terms ON item_id = term_id where item_type like '%other%' AND briefcase_id = (?)",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getDefinitions = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT item_id,item_type,post_title from briefcase_rel LEFT JOIN posts ON item_id = ID where item_type like '%definition%'  AND briefcase_id = (?)",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getPosts = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT item_id,item_type,post_title from briefcase_rel LEFT JOIN posts ON item_id = ID where item_type like '%post%' AND briefcase_id = (?)",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getNotes = function (briefcaseID) {
      var parameters = [briefcaseID];
      return DBA.query(
        "SELECT item_id,title,content,id,item_type,briefcase_id from briefcase_rel LEFT JOIN notes ON item_id = id where item_type = 'note' AND section = 0 and briefcase_id = (?) ",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };

    return self;
  })
  .factory("taxTopicService", function (DBA) {
    var self = this;
    self.getTaxTopics = function (parentName) {
      var topicName = "";
      if (parentName == "Tax topics") {
        topicName = "tax-topic";
      }
      if (parentName == "VAT topics") {
        topicName = "vat_topic";
      }
      console.log("parentName: " + parentName);
      var parameters = [topicName];
      return DBA.query(
        "SELECT term_taxonomy.term_id,name FROM term_taxonomy LEFT JOIN terms on term_taxonomy.term_id = terms.term_id where term_taxonomy.taxonomy = (?) order by name ASC",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getTaxTopicITAItems = function (termID) {
      var parameters = [termID];
      return DBA.query(
        "SELECT ID,post_title,collection from posts LEFT JOIN term_relationships ON ID = object_id where term_taxonomy_id = (?) AND collection = 597 AND  post_title NOT LIKE '%Paragraph%' AND post_title NOT LIKE '%Schedule%' ",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getTaxTopicTAAItems = function (termID) {
      var parameters = [termID];
      return DBA.query(
        "SELECT ID,post_title,collection from posts LEFT JOIN term_relationships ON ID = object_id where term_taxonomy_id = (?) AND collection = 598 ",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getTaxTopicParagraphs = function (termID) {
      var parameters = [termID];
      return DBA.query(
        "SELECT ID,post_title,collection from posts LEFT JOIN term_relationships ON ID = object_id where term_taxonomy_id = (?) AND collection = 597 AND (post_title LIKE '%Paragraph%' OR post_title LIKE '%Schedule%') ",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };

    self.getTaxTopicVATItems = function (termID) {
      var parameters = [termID];
      return DBA.query(
        "SELECT ID,post_title,collection from posts LEFT JOIN term_relationships ON ID = object_id where term_taxonomy_id = (?) AND collection = 1525 ",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };

    self.getTaxTopicCustomsItems = function (termID) {
      var parameters = [termID];
      return DBA.query(
        "SELECT ID,post_title,collection from posts LEFT JOIN term_relationships ON ID = object_id where term_taxonomy_id = (?) AND collection = 1627 ",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };

    self.getTaxTopicEstateItems = function (termID) {
      var parameters = [termID];
      return DBA.query(
        "SELECT ID,post_title,collection from posts LEFT JOIN term_relationships ON ID = object_id where term_taxonomy_id = (?) AND collection = 1846 ",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };

    self.getTaxTopicTransferItems = function (termID) {
      var parameters = [termID];
      return DBA.query(
        "SELECT ID,post_title,collection from posts LEFT JOIN term_relationships ON ID = object_id where term_taxonomy_id = (?) AND collection = 1876 ",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };

    self.definitionCheck = function (postID) {
      var parameters = [postID];
      return DBA.query(
        "SELECT object_id from term_relationships where object_id = (?) AND term_taxonomy_id = 2",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getOtherItems = function (termID) {
      var parameters = [termID];
      return DBA.query(
        "SELECT ID,post_title,collection from posts LEFT JOIN term_relationships ON ID = object_id where term_taxonomy_id = (?) AND (collection = 936 OR collection = 1010 OR collection = 1011 OR collection = 1917 OR collection = 2031) ",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };

    return self;
  })
  .factory("DTAService", function (DBA) {
    var self = this;
    self.getDTAs = function (parentID) {
      var parameters = [parentID];
      return DBA.query(
        "SELECT term_taxonomy.term_id,name FROM term_taxonomy LEFT JOIN terms on term_taxonomy.term_id = terms.term_id where term_taxonomy.parent = (?) order by name ASC",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getSARSINs = function (parentID) {
      var parameters = [parentID];
      return DBA.query(
        "SELECT term_taxonomy.term_id,name,term_order FROM term_taxonomy LEFT JOIN terms on term_taxonomy.term_id = terms.term_id where term_taxonomy.parent = (?) order by term_order ASC",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getSARSPNs = function (parentID) {
      var parameters = [parentID];
      return DBA.query(
        "SELECT term_taxonomy.term_id,name,term_order FROM term_taxonomy LEFT JOIN terms on term_taxonomy.term_id = terms.term_id where term_taxonomy.parent = (?) order by term_order ASC",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getSARSVATINs = function (parentID) {
      var parameters = [parentID];
      return DBA.query(
        "SELECT term_taxonomy.term_id,name,term_order FROM term_taxonomy LEFT JOIN terms on term_taxonomy.term_id = terms.term_id where term_taxonomy.parent = (?) order by term_order ASC",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getOTLs = function () {
      return DBA.query(
        "SELECT term_taxonomy.term_id,name,term_order FROM term_taxonomy LEFT JOIN terms on term_taxonomy.term_id = terms.term_id where term_taxonomy.parent = 2535 order by term_order ASC"
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };

    self.getRGNs = function () {
      return DBA.query(
        "SELECT term_taxonomy.term_id,name,term_order FROM term_taxonomy LEFT JOIN terms on term_taxonomy.term_id = terms.term_id where term_taxonomy.parent = 2506 order by term_order ASC"
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    self.getSGs = function () {
      return DBA.query(
        "SELECT term_taxonomy.term_id,name,term_order FROM term_taxonomy LEFT JOIN terms on term_taxonomy.term_id = terms.term_id where term_taxonomy.parent = 2540 order by term_order ASC"
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    return self;
  })
  .factory("definitionsService", function (DBA) {
    var self = this;
    self.getDefinitions = function (parentID) {
      var parameters = [parentID];
      return DBA.query(
        "SELECT ID,post_title FROM posts LEFT JOIN term_relationships ON object_id = ID where term_taxonomy_id = (?) order by post_title ASC",
        parameters
      ).then(function (result) {
        return DBA.getAll(result);
      });
    };
    return self;
  })
  .factory("searchService", function ($cordovaSQLite, DBA, searchCacheService) {
    return {
      search: function (query, location) {
        var hyphenatedQuery = "";
        if (query.split(" ").length > 1) {
          for (var i = 0; i < query.split(" ").length; i++) {
            if (i < query.split(" ").length - 1) {
              hyphenatedQuery += query.split(" ")[i] + "-";
            } else {
              hyphenatedQuery += query.split(" ")[i];
            }
          }
        } else {
          hyphenatedQuery = query;
        }
        console.log(`hyphenatedQuery: ${hyphenatedQuery}`);

        if (location) {
          var parameters = [
            "%" + query + "%",
            location,
            "%" + hyphenatedQuery + "%",
          ];

          return (
            DBA.query(
              "SELECT  distinct posts.ID,posts.post_title,terms.name,terms.term_id FROM posts LEFT JOIN term_relationships ON term_relationships.object_id = posts.ID LEFT JOIN terms ON term_relationships.term_taxonomy_id = terms.term_id LEFT JOIN term_taxonomy ON terms.term_id = term_taxonomy.term_id where term_taxonomy.taxonomy != 'tax-topic' AND term_taxonomy.taxonomy != 'vat_topic' AND terms.term_group != 936 AND terms.term_id != 2  AND terms.term_id != 934 AND (posts.post_content like ? OR posts.post_title like ?) and collection = ?",
              parameters
            )
              //return DBA.query("SELECT ID,post_content,post_title from posts where post_content like ?", parameters)

              .then(function (result) {
                return DBA.getAll(result);
              })
          );
        } else {
          var parameters = [
            "%" + query + "%",
            "%" + query + "%",
            "%" + hyphenatedQuery + "%",
            "%" + hyphenatedQuery + "%",
          ];

          return (
            DBA.query(
              "SELECT distinct posts.ID,posts.post_title,posts.collection,terms.name,terms.term_id FROM posts LEFT JOIN term_relationships ON term_relationships.object_id = posts.ID LEFT JOIN terms ON term_relationships.term_taxonomy_id = terms.term_id LEFT JOIN term_taxonomy ON terms.term_id = term_taxonomy.term_id where term_taxonomy.taxonomy != 'tax-topic' AND term_taxonomy.taxonomy != 'vat_topic' AND terms.term_group != 936 AND terms.term_id != 2  AND terms.term_id != 934 AND (posts.post_content like ? OR terms.name like ? OR posts.post_title like ? OR terms.name like ?)",
              parameters
            )
              //return DBA.query("SELECT ID,post_content,post_title from posts where post_content like ?", parameters)

              .then(function (result) {
                return DBA.getAll(result);
              })
          );
        }
      },

      getSearchTerms: function (search) {
        return searchCacheService.get(search);
      },
      clearSearchTerms: function (search) {
        var searchTerms = [];

        searchCacheService.put(search, searchTerms);
      },
      addSearchTerm: function (search, searchTerm) {
        var searchTerms = [];
        if (searchCacheService.get(search)) {
          searchTerms = searchCacheService.get(search);
          searchTerms.push(searchTerm);
        } else {
          searchTerms.push(searchTerm);
        }
        searchCacheService.put(search, searchTerms);
      },
      getLatestSearchResults: function () {
        var latestSearchTerm = searchCacheService.get("latestSearchTerm");
        var latestSearchResults = searchCacheService.get("latestSearchResults");
        var latestSearchResults = { latestSearchTerm, latestSearchResults };
        return latestSearchResults;
      },
      addLatestSearchResults: function (searchTerm, searchResults) {
        searchCacheService.put("latestSearchTerm", searchTerm);
        searchCacheService.put("latestSearchResults", searchResults);
      },
      getCollectionFromPostID: function (postID) {
        var parameters = [postID];
        return DBA.query(
          "SELECT collection FROM posts WHERE id = (?)",
          parameters
        ).then(function (result) {
          return DBA.getById(result);
        });
      },
      getTermNameFromPostID: function (postID) {
        var parameters = [postID];
        return DBA.query(
          "SELECT name FROM terms LEFT JOIN term_relationships ON term_taxonomy_id = term_id WHERE object_id = (?)",
          parameters
        ).then(function (result) {
          return DBA.getById(result);
        });
      },
      getTermNameFromID: function (termID) {
        var parameters = [termID];
        return DBA.query(
          "SELECT name FROM terms WHERE term_id = (?)",
          parameters
        ).then(function (result) {
          return DBA.getById(result);
        });
      },
    };
  })

  .factory("DBA", function ($cordovaSQLite, $q, $ionicPlatform) {
    var self = this;

    // Handle query's and potential errors
    self.query = function (query, parameters) {
      parameters = parameters || [];
      var q = $q.defer();

      $ionicPlatform.ready(function () {
        $cordovaSQLite.execute(db, query, parameters).then(
          function (result) {
            q.resolve(result);
          },
          function (error) {
            console.warn("I found an error");
            console.warn(JSON.stringify(error));
            q.reject(error);
          }
        );
      });
      return q.promise;
    };

    // Proces a result set of Cats
    self.getCats = function (result) {
      var output = [];
      var hasChildren = $q.defer();
      for (var i = 0; i < result.rows.length; i++) {
        var parameters = [result.rows.item(i).term_id];

        self
          .query(
            "SELECT term_id FROM term_taxonomy where parent = (?)",
            parameters
          )
          .then(function (res) {
            var hasChildrentemp = "";
            if (res.rows.length > 0) {
              hasChildrentemp = 1;
            } else {
              hasChildrentemp = "";
            }
            hasChildren.resolve({ check: hasChildrentemp });

            //   output[i].hasChildren = hasChildren;
          });
        var promise = hasChildren.promise;

        promise.then(
          function (data) {
            result.rows.item(i).hasChildren = data;
          },
          function (reason) {}
        );

        output.push(result.rows.item(i));
      }
      return output;
    };
    // Proces a result set
    self.getAll = function (result) {
      var output = [];

      for (var i = 0; i < result.rows.length; i++) {
        output.push(result.rows.item(i));
      }
      return output;
    };

    self.getAllConcat = function (result) {
      var output = "";

      for (var i = 0; i < result.rows.length; i++) {
        output =
          output +
          '<div id="#' +
          result.rows.item(i).ID +
          '">' +
          result.rows.item(i).post_content +
          "</div>";
      }
      return output;
    };

    // Proces a single result
    self.getById = function (result) {
      var output = null;
      output = angular.copy(result.rows.item(0));
      return output;
    };

    return self;
  })

  .factory(
    "taxActDataService",
    function (encodeURIService, $cordovaSQLite, DBA) {
      self.getSinglePostAll = function (postID) {
        var parameters = [postID];
        return DBA.query("SELECT * FROM posts WHERE id = (?)", parameters).then(
          function (result) {
            return DBA.getById(result);
          }
        );
      };
      self.getTaxActSinglePost = function (postID) {
        var parameters = [postID];
        return DBA.query(
          "SELECT post_title, post_content FROM posts WHERE id = (?)",
          parameters
        ).then(function (result) {
          return DBA.getById(result);
        });
      };
      self.getTaxActFull = function (catID) {
        var parameters = [catID, catID];

        //  return DBA.query("SELECT posts.ID, posts.post_content,posts.collection,posts.collection_order,term_relationships.term_taxonomy_id FROM posts LEFT JOIN term_relationships ON posts.ID = term_relationships.object_id WHERE posts.collection = (?) ORDER BY posts.collection_order ASC", parameters)
        return (
          DBA.query(
            "SELECT posts.ID, posts.post_content,posts.post_title,posts.collection,posts.collection_order,term_relationships.term_taxonomy_id FROM posts LEFT JOIN term_relationships ON posts.ID = term_relationships.object_id LEFT JOIN terms ON term_relationships.term_taxonomy_id = terms.term_id WHERE terms.term_group = (?) AND posts.collection = (?)  ORDER BY posts.collection_order ASC",
            parameters
          )
            //SELECT wp_posts.ID,wp_posts.post_title,wp_terms.term_id,wp_terms.term_group FROM wp_posts  LEFT JOIN wp_term_relationships ON wp_posts.ID = wp_term_relationships.object_id LEFT JOIN wp_terms ON wp_term_relationships.term_taxonomy_id = wp_terms.term_id WHERE wp_terms.term_group = 597

            .then(function (result) {
              return DBA.getAll(result);
            })
        );

        /*
  //http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20IN%20(%22YHOO%22)&format=json&env=http://datatables.org/alltables.env
//  var deferred =$q.defer(),
  var deferred2 =$q.defer(),


  url = 'http://lyticom.com/kmos/wp-json/wp/v2/posts/'+postID;
  console.log(url);


    $http.get(url)
    .success(function(json){
    var jsonData = json;
  console.log(jsonData);
       deferred.resolve(jsonData);

        })
      .error(function(error){

        console.log("Details data error: "+error);
        deferred.reject();
      });


    //return deferred.promise;

var singlePost = 'pop';
  $ionicPlatform.ready(function () {
    var query = "SELECT post_content FROM posts WHERE ID ='14';";
  //  var query = "SELECT name FROM sqlite_master WHERE type='table';";
      $cordovaSQLite.execute(db, query).then(function(res) {
          if(res.rows.length > 0) {
            console.log('Table name -> '+res.rows.item(0).post_content);
            deferred2.resolve(res.rows.item(0));
          } else {
              console.log("No results found");
          }
      }, function (err) {
          console.error('post error '+err);
          deferred2.reject();
      });
    });
      return deferred2.promise;
*/
      };

      self.getTaxActTerms = function (catID) {
        var parameters = [catID];
        return DBA.query(
          "SELECT term_id,name,term_group,group_order from terms where term_group = (?) order by group_order ASC",
          parameters
        ).then(function (result) {
          return DBA.getAll(result);
        });
      };

      self.update = function (origMember, editMember) {
        var parameters = [editMember.id, editMember.name, origMember.id];
        return DBA.query(
          "UPDATE team SET id = (?), name = (?) WHERE id = (?)",
          parameters
        );
      };

      self.getSplicedTaxAct = function (postID, data) {
        function findWithAttr(array, attr, value) {
          for (var i = 0; i < array.length; i += 1) {
            if (array[i][attr] === value) {
              return i;
            }
          }
          return -1;
        }

        var indexOfPost = findWithAttr(data, "ID", postID);
        var newArray = [];
        if (indexOfPost > 5) {
          newArray[0] = data.slice(0, indexOfPost - 1);
          newArray[1] = data.slice(indexOfPost - 5);
        } else {
          newArray[0] = data.slice(0, indexOfPost - 1);
          newArray[1] = data.slice(indexOfPost);
        }
        newArray[2] = indexOfPost;
        return newArray;
      };

      self.getPostBlock = function (postID, data) {
        function findWithAttr(array, attr, value) {
          for (var i = 0; i < array.length; i += 1) {
            if (array[i][attr] === value) {
              return i;
            }
          }
          return -1;
        }

        var indexOfPost = findWithAttr(data, "ID", postID);
        var newArray = [];

        newArray[0] = data.slice(0, indexOfPost - 11);
        newArray[1] = data.slice(indexOfPost - 10, indexOfPost + 10);
        newArray[2] = data.slice(indexOfPost + 11);
        newArray[3] = indexOfPost;
        return newArray;
      };

      self.getPostIDIndex = function (postID, data) {
        function findWithAttr(array, attr, value) {
          for (var i = 0; i < array.length; i += 1) {
            if (array[i][attr] === value) {
              return i;
            }
          }
          return -1;
        }

        var indexOfPost = findWithAttr(data, "ID", postID);

        return indexOfPost;
      };

      self.getPostCategoryIndex = function (postID, termsArray, postsArray) {
        function findWithAttr(array, attr, value) {
          for (var i = 0; i < array.length; i += 1) {
            if (array[i][attr] === value) {
              return i;
            }
          }
          return -1;
        }
        for (var ind = 0; ind < postsArray.length; ind++) {
          if (postsArray[ind].ID == postID) {
            var termID = postsArray[ind].term_taxonomy_id;
          }
        }

        var indexOfTerm = findWithAttr(termsArray, "term_id", termID);
        console.log("TermID " + termID);
        console.log("PostID " + postID);
        return indexOfTerm;

        //  console.log('Outpu
      };

      self.getCollectionFromPostID = function (postID) {
        var parameters = [postID];
        return DBA.query(
          "SELECT collection FROM posts WHERE id = (?)",
          parameters
        ).then(function (result) {
          return DBA.getById(result);
        });
      };
      self.getPostCategoryNameByPostIDFromDB = function (
        postID,
        postCollection
      ) {
        var parameters = [postCollection, postCollection, postID];

        //  return DBA.query("SELECT posts.ID, posts.post_content,posts.collection,posts.collection_order,term_relationships.term_taxonomy_id FROM posts LEFT JOIN term_relationships ON posts.ID = term_relationships.object_id WHERE posts.collection = (?) ORDER BY posts.collection_order ASC", parameters)
        return (
          DBA.query(
            "SELECT posts.ID,terms.name FROM posts LEFT JOIN term_relationships ON posts.ID = term_relationships.object_id LEFT JOIN terms ON term_relationships.term_taxonomy_id = terms.term_id WHERE terms.term_group = (?) AND posts.collection = (?)  AND posts.ID = (?)",
            parameters
          )
            //SELECT wp_posts.ID,wp_posts.post_title,wp_terms.term_id,wp_terms.term_group FROM wp_posts  LEFT JOIN wp_term_relationships ON wp_posts.ID = wp_term_relationships.object_id LEFT JOIN wp_terms ON wp_term_relationships.term_taxonomy_id = wp_terms.term_id WHERE wp_terms.term_group = 597

            .then(function (result) {
              return DBA.getById(result);
            })
        );
      };
      self.getPostIDByTermIDFromDB = function (termID) {
        var parameters = [termID];

        //  return DBA.query("SELECT posts.ID, posts.post_content,posts.collection,posts.collection_order,term_relationships.term_taxonomy_id FROM posts LEFT JOIN term_relationships ON posts.ID = term_relationships.object_id WHERE posts.collection = (?) ORDER BY posts.collection_order ASC", parameters)
        return (
          DBA.query(
            "SELECT posts.ID FROM posts LEFT JOIN term_relationships ON posts.ID = term_relationships.object_id  WHERE term_taxonomy_id = (?)",
            parameters
          )
            //SELECT wp_posts.ID,wp_posts.post_title,wp_terms.term_id,wp_terms.term_group FROM wp_posts  LEFT JOIN wp_term_relationships ON wp_posts.ID = wp_term_relationships.object_id LEFT JOIN wp_terms ON wp_term_relationships.term_taxonomy_id = wp_terms.term_id WHERE wp_terms.term_group = 597

            .then(function (result) {
              return DBA.getById(result);
            })
        );
      };
      self.getPostCategoryNameByPostID = function (
        postID,
        termsArray,
        postsArray
      ) {
        function findWithAttr(array, attr, value) {
          for (var i = 0; i < array.length; i += 1) {
            if (array[i][attr] === value) {
              return i;
            }
          }
          return -1;
        }

        for (var ind = 0; ind < postsArray.length; ind++) {
          if (postsArray[ind].ID == 1279) {
            //console.log('found 1285!');
          }
          if (postsArray[ind].ID == postID) {
            var termID = postsArray[ind].term_taxonomy_id;
            console.log("in service - term id " + termID);
          }
        }

        for (var i = 0; i < termsArray.length; i += 1) {
          if (termsArray[i].term_id === termID) {
            return termsArray[i].name;
          }
        }
        return "Error: Name not found";
      };
      self.getAmmendments = function (itemID, itemType) {
        if (itemType == "definition") {
          itemType = "post";
        }
        console.log("itemType " + itemType);
        var parameters = [itemID, itemType];
        return DBA.query(
          "SELECT content FROM ammendments WHERE item_id = (?) AND item_type = (?)",
          parameters
        ).then(function (result) {
          return DBA.getById(result);
        });
      };
      self.getAmmendmentsAll = function () {
        return DBA.query("SELECT * from ammendments").then(function (result) {
          return DBA.getAll(result);
        });
      };
      self.getTaxActPosts = function (catID) {
        var parameters = [catID];
        //return DBA.query("SELECT posts.ID, posts.post_title, posts.post_content,term_relationships.term_taxonomy_id FROM posts INNER JOIN term_relationships ON posts.ID = term_relationships.object_id and term_relationships.term_taxonomy_id = (?)", parameters)
        return (
          DBA.query(
            "SELECT posts.ID, posts.post_title, posts.post_content,term_relationships.term_taxonomy_id FROM posts INNER JOIN term_relationships ON posts.ID = term_relationships.object_id and term_relationships.term_taxonomy_id = (?)",
            parameters
          )
            //
            .then(function (result) {
              return DBA.getAll(result);
            })
        );

        /*
//http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20IN%20(%22YHOO%22)&format=json&env=http://datatables.org/alltables.env
var deferred =$q.defer(),


url = 'http://lyticom.com/kmos/wp-json/wp/v2/posts?filter[cat]='+catID+'&filter[posts_per_page]=-1&orderby=title&order=asc';
console.log(url);


  $http.get(url)
  .success(function(json){
  var jsonData = json;
console.log(jsonData);
     deferred.resolve(jsonData);

      })
    .error(function(error){

      console.log("Details data error: "+error);
      deferred.reject();
    });


  return deferred.promise;
*/
      };

      self.getTermPosts = function (term_id, data) {
        var output = [];

        for (var i = 0; i < data.length; i++) {
          //if (data[i].ID == 17) {console.log('Index' + data[i].post_content);}
          if (data[i].term_taxonomy_id == term_id) {
            output.push(data[i]);
          }
        }
        //  console.log('Output: ' +output);
        return output;
      };

      self.getTaxActCats = function (parentCatID) {
        var excludeCat1 = "";
        if (parentCatID === 0 || parentCatID == ":" || parentCatID === "") {
          excludeCat1 = "exclude=1&";
          parentCatID = 0;
        }
        var parameters = [parentCatID];
        return DBA.query(
          "SELECT terms.term_id,terms.name,terms.term_order,terms.has_children FROM terms INNER JOIN term_taxonomy ON term_taxonomy.parent = (?) AND term_taxonomy.term_id = terms.term_id AND term_taxonomy.taxonomy = 'category' WHERE terms.term_id != 1 ",
          parameters
        ).then(function (result) {
          return DBA.getAll(result);
        });
        /*
//http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20IN%20(%22YHOO%22)&format=json&env=http://datatables.org/alltables.env
var excludeCat1 = '';
if (parentCatID === 0 || parentCatID == ':' || parentCatID === '') {
  excludeCat1 = 'exclude=1&';
  parentCatID = 0;
}
var deferred =$q.defer(),

url = 'http://lyticom.com/kmos/wp-json/wp/v2/categories?'+excludeCat1+'parent='+parentCatID+'&per_page=100&orderby=id';
console.log(url);


  $http.get(url)
  .success(function(json){
  var jsonData = json;
console.log(jsonData);
     deferred.resolve(jsonData);

      })
    .error(function(error){

      console.log("Categories data error: "+error);
      deferred.reject();
    });


  return deferred.promise;
*/
      };

      self.catHasChildren = function (CatID) {
        var parameters = [CatID];
        var hasChildren = false;
        return DBA.query(
          "SELECT term_id FROM term_taxonomy where parent = (?)",
          parameters
        ).then(function (result) {
          if (result.rows.length > 0) {
            hasChildren = true;
          } else {
            hasChildren = false;
          }
          return { cat_id: CatID, hasChildren: hasChildren };
        });
      };

      return self;

      /* {
getTaxActPosts:getTaxActPosts,
getTaxActCats:getTaxActCats,
getTaxActSinglePost:getTaxActSinglePost
  };*/
    }
  )
  .factory(
    "updateService",
    function ($http, $q, DBA, dateService, encodeURIService, $ionicLoading) {
      var self = this;

      self.getPostsLocalDB = function () {
        return DBA.query("SELECT ID,post_title from posts").then(function (
          result
        ) {
          return DBA.getAll(result);
        });
      };
      self.getLocalDBTerms = function () {
        return DBA.query("SELECT * from terms").then(function (result) {
          return DBA.getAll(result);
        });
      };
      self.getLocalDBTermTaxonomy = function () {
        return DBA.query("SELECT * from term_taxonomy").then(function (result) {
          return DBA.getAll(result);
        });
      };
      self.getLocalDBTermRel = function () {
        return DBA.query("SELECT * from term_relationships").then(function (
          result
        ) {
          return DBA.getAll(result);
        });
      };
      self.getDeletedPosts = function (localPosts, remotePosts) {
        var deletedPosts = [];
        for (var i = 0; i < localPosts.length; i++) {
          for (var j = 0; j < remotePosts.length; j++) {
            if (localPosts[i].ID == remotePosts[j].ID) {
              localPosts[i].exists = 1;
            }
          }
          if (localPosts[i].exists == null) {
            deletedPosts.push(localPosts[i]);
          }
        }
        return deletedPosts;
      };
      self.getRecord = function () {
        return DBA.query(
          "SELECT post_id FROM reorder_post_rel WHERE id = 10"
        ).then(function (result) {
          return DBA.getById(result);
        });
      };
      self.getLastUpdated = function () {
        return DBA.query(
          "SELECT date_modified FROM app_vars WHERE name = 'last_update'"
        ).then(function (result) {
          return DBA.getById(result);
        });
      };
      self.updateLastUpdated = function () {
        var parameters = [dateService.currentDateFull()];

        return DBA.query(
          "UPDATE app_vars SET date_modified = (?)  WHERE name = 'last_update'",
          parameters
        );
      };

      self.getLastUpdatedPdf = function () {
        return DBA.query(
          "SELECT date_modified FROM app_vars WHERE name = 'last_updated_pdf'"
        ).then(function (result) {
          return DBA.getById(result);
        });
      };
      self.updateLastUpdatedPdf = function () {
        var parameters = [dateService.currentDateFull()];

        return DBA.query(
          "UPDATE app_vars SET date_modified = (?)  WHERE name = 'last_updated_pdf'",
          parameters
        );
      };

      self.insertLastUpdatedPdf = function () {
        var parameters = [dateService.currentDateFull()];

        return DBA.query(
          "INSERT INTO app_vars (name, date_modified) values ('last_updated_pdf',(?))",
          parameters
        );
      };
      self.getLastCancelled = function () {
        return DBA.query(
          "SELECT date_modified FROM app_vars WHERE name = 'last_cancelled'"
        ).then(function (result) {
          return DBA.getById(result);
        });
      };
      self.updateLastCancelled = function () {
        var parameters = [dateService.currentDateFull()];

        return DBA.query(
          "UPDATE app_vars SET date_modified = (?)  WHERE name = 'last_cancelled'",
          parameters
        );
      };

      self.insertLastCancelled = function () {
        var parameters = [dateService.currentDateFull()];

        return DBA.query(
          "INSERT INTO app_vars (name, date_modified) values ('last_cancelled',(?))",
          parameters
        );
      };

      self.isWithinLastCancelledRange = function (days) {
        var currentDate = dateService.currentDateFull();

        return DBA.query(
          "SELECT date_modified FROM app_vars WHERE name = 'last_cancelled'"
        ).then(function (result) {
          var resultDate = DBA.getById(result);
          if (!resultDate) {
            return false;
          }
          var date1 = new Date(resultDate.date_modified.split(" ")[0]);
          var date2 = new Date(currentDate.split(" ")[0]);
          var timeDiff = Math.abs(date2.getTime() - date1.getTime());
          var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
          console.log(`date1: ${date1}`);
          console.log(`date2: ${date2}`);
          console.log(`timeDiff: ${timeDiff}`);
          console.log(`diffDays: ${diffDays}`);
          if (diffDays <= days) {
            return true;
          } else {
            return false;
          }
        });
      };
      self.deleteTerms = function () {
        return DBA.query("delete from terms");
      };
      self.updateTerm = function (term) {
        var parameters = [
          term.term_id,
          term.name,
          term.slug,
          term.term_group,
          term.term_order,
          term.group_order,
        ];
        console.log("term_name " + term.name);
        return DBA.query(
          "INSERT INTO  terms (term_id,name,slug,term_group,term_order,group_order) VALUES ((?),(?),(?),(?),(?),(?))",
          parameters
        );
      };

      self.insertResultsIntoDB = function (arr, tableName) {
        console.log("table name " + tableName);
        var json = {
          data: {
            inserts: {
              [tableName]: arr,
            },
          },
        };
        var successFn = function (count) {
          console.log(
            "Successfully imported JSON to DB; equivalent to " +
              count +
              " SQL statements"
          );
          var pBar = document.getElementById("progress-bar");
          var progressBarCurrentValue = pBar.value;
          pBar.value = progressBarCurrentValue + 5;
          pBar.getElementsByTagName("span")[0].innerHTML = Math.floor(
            pBar.value
          );
          //  $ionicLoading.hide();
        };
        var errorFn = function (error) {
          alert("The following error occurred: " + error.message);
        };
        var progressFn = function (current, total) {
          console.log("Imported " + current + "/" + total + " statements");
        };
        cordova.plugins.sqlitePorter.importJsonToDb(db, json, {
          successFn: successFn,
          errorFn: errorFn,
          progressFn: progressFn,
        });
      };
      self.deleteTermTaxonomy = function () {
        return DBA.query("delete from term_taxonomy");
      };
      self.updateTermTaxonomy = function (term) {
        var parameters = [
          term.term_taxonomy_id,
          term.term_id,
          term.taxonomy,
          term.parent,
          term.count,
        ];
        console.log("term_name " + term.name);
        return DBA.query(
          "INSERT INTO  term_taxonomy (term_taxonomy_id,term_id,taxonomy,parent,count) VALUES ((?),(?),(?),(?),(?))",
          parameters
        );
      };
      self.deleteTermRelationships = function () {
        return DBA.query("delete from term_relationships");
      };
      self.updateTermRelationships = function (term) {
        var parameters = [term.term_taxonomy_id, term.object_id];
        //console.log('term_name '+term.name);
        return DBA.query(
          "INSERT INTO  term_relationships (term_taxonomy_id,object_id) VALUES ((?),(?))",
          parameters
        );
      };
      self.deleteAmmendments = function () {
        return DBA.query("delete from ammendments");
      };
      self.updateReorder = function (data) {
        DBA.query("delete from reorder_post_rel");
        for (var i = 0; i < data.length; i++) {
          var parameters = [data[i].id, data[i].category_id, data[i].post_id];

          DBA.query(
            "INSERT INTO  reorder_post_rel (id,category_id,post_id) VALUES ((?),(?),(?))",
            parameters
          );
          console.log("post id " + data[i].post_id);
        }
        return;
      };
      self.deletePost = function (post) {
        var parameters = [post.ID];
        return DBA.query("DELETE from posts WHERE ID = (?)", parameters);
      };

      self.updatePosts = function (posts, localPosts, dateLastUpdated) {
        var postUpdatesAllData = [];
        var postUpdatesCollectionOnly = [];
        var postInserts = [];
        for (var i = 0; i < posts.length; i++) {
          for (var j = 0; j < localPosts.length; j++) {
            if (posts[i].ID == localPosts[j].ID) {
              posts[i].existsInLocalPosts = 1;
            }
          }
          if (posts[i].existsInLocalPosts == 1) {
            //console.log('this post is older');
            if (posts[i].post_content == "") {
              var formattedCollectionOnlyUpdate = {
                set: { collection_order: posts[i].collection_order },
                where: { ID: posts[i].ID },
              };
              /*  var parameters = [post.collection_order,post.ID];
            return  DBA.query("UPDATE posts SET collection_order = (?)  WHERE ID = (?)", parameters); */
              postUpdatesCollectionOnly.push(formattedCollectionOnlyUpdate);
            } else {
              /*    var parameters = [post.post_title,post.post_content,post.collection_order,post.ID];
        return DBA.query("UPDATE posts SET post_title = (?), post_content = (?), collection_order = (?)  WHERE ID = (?)", parameters);
        */
              var formattedAllDataUpdate = {
                set: {
                  post_title: posts[i].post_title,
                  post_content: posts[i].post_content,
                  collection_order: posts[i].collection_order,
                },
                where: { ID: posts[i].ID },
              };
              postUpdatesAllData.push(formattedAllDataUpdate);
            }
          } else {
            //console.log('this post is newer');
            /*  var parameters = [post.ID,post.post_content,post.post_title,post.collection_order,post.collection];
        return DBA.query("INSERT INTO posts (ID,post_content,post_title,collection_order,collection) VALUES ((?),(?),(?),(?),(?)) ", parameters);
      */
            delete posts[i].post_date;
            postInserts.push(posts[i]);
          }
        }

        //  console.log('Post: '+post.post_title);
        //  console.log('Date last updated: '+dateLastUpdated);
        var json = {
          data: {
            inserts: {
              posts: postInserts,
            },
            updates: {
              posts: postUpdatesCollectionOnly,
            },
          },
        };
        var json2 = {
          data: {
            updates: {
              posts: postUpdatesAllData,
            },
          },
        };
        var successFn = function (count) {
          console.log(
            "Successfully imported JSON to DB; equivalent to " +
              count +
              " SQL statements"
          );
          //$ionicLoading.hide();
        };
        var successFn2 = function (count) {
          console.log(
            "Successfully imported JSON to DB; equivalent to " +
              count +
              " SQL statements"
          );
          //$ionicLoading.hide();
        };
        var errorFn = function (error) {
          alert("The following error occurred: " + error.message);
        };
        var progressCounter = 0;
        var progressFn = function (current, total) {
          console.log("Imported " + current + "/" + total + " statements");
          var pBar = document.getElementById("progress-bar");
          var progressBarCurrentValue = pBar.value;
          progressCounter = progressCounter + 40 / total;
          if (progressCounter > 1) {
            pBar.value = pBar.value + 1;
            progressCounter = 0;
          }
        };
        cordova.plugins.sqlitePorter.importJsonToDb(db, json, {
          successFn: successFn,
          errorFn: errorFn,
          progressFn: progressFn,
        });
        cordova.plugins.sqlitePorter.importJsonToDb(db, json2, {
          successFn: successFn2,
          errorFn: errorFn,
          progressFn: progressFn,
        });
      };
      self.updatePostsVAT = function (posts, localPosts, dateLastUpdated) {
        var deferred = $q.defer();
        var postUpdatesAllData = [];

        var postUpdatesCollectionOnly = [];
        var postInserts = [];
        for (var i = 0; i < posts.length; i++) {
          for (var j = 0; j < localPosts.length; j++) {
            if (posts[i].ID == localPosts[j].ID) {
              posts[i].existsInLocalPosts = 1;
            }
          }
          if (posts[i].existsInLocalPosts == 1) {
            //console.log('this post is older');
            if (posts[i].post_content == "") {
              var formattedCollectionOnlyUpdate = {
                set: { collection_order: posts[i].collection_order },
                where: { ID: posts[i].ID },
              };
              /*  var parameters = [post.collection_order,post.ID];
                return  DBA.query("UPDATE posts SET collection_order = (?)  WHERE ID = (?)", parameters); */
              postUpdatesCollectionOnly.push(formattedCollectionOnlyUpdate);
            } else {
              /*    var parameters = [post.post_title,post.post_content,post.collection_order,post.ID];
            return DBA.query("UPDATE posts SET post_title = (?), post_content = (?), collection_order = (?)  WHERE ID = (?)", parameters);
            */
              var formattedAllDataUpdate = {
                set: {
                  post_title: posts[i].post_title,
                  post_content: posts[i].post_content,
                  collection_order: posts[i].collection_order,
                },
                where: { ID: posts[i].ID },
              };
              postUpdatesAllData.push(formattedAllDataUpdate);
            }
          } else {
            //console.log('this post is newer');
            /*  var parameters = [post.ID,post.post_content,post.post_title,post.collection_order,post.collection];
            return DBA.query("INSERT INTO posts (ID,post_content,post_title,collection_order,collection) VALUES ((?),(?),(?),(?),(?)) ", parameters);
          */
            delete posts[i].post_date;
            postInserts.push(posts[i]);
          }
        }

        //  console.log('Post: '+post.post_title);
        //  console.log('Date last updated: '+dateLastUpdated);
        var json = {
          data: {
            inserts: {
              posts: postInserts,
            },
            updates: {
              posts: postUpdatesCollectionOnly,
            },
          },
        };
        var json2 = {
          data: {
            updates: {
              posts: postUpdatesAllData,
            },
          },
        };
        var successFn = function (count) {
          console.log(
            "Successfully imported JSON to DB; equivalent to " +
              count +
              " SQL statements"
          );
          //$ionicLoading.hide();
        };
        var successFn2 = function (count) {
          console.log(
            "Successfully imported JSON to DB; equivalent to " +
              count +
              " SQL statements"
          );
          deferred.resolve();
        };
        var errorFn = function (error) {
          alert("The following error occurred: " + error.message);
        };
        var progressCounter = 0;
        var progressFn1 = function (current, total) {
          console.log("Imported " + current + "/" + total + " statements");
          var pBar = document.getElementById("progress-bar");
          var progressBarCurrentValue = pBar.value;
          progressCounter = progressCounter + 20 / total;
          if (progressCounter > 1) {
            pBar.value = pBar.value + 1;
            progressCounter = 0;
          }
        };
        var progressFn2 = function (current, total) {
          console.log("Imported " + current + "/" + total + " statements");
          var pBar = document.getElementById("progress-bar");
          var progressBarCurrentValue = pBar.value;
          progressCounter = progressCounter + 20 / total;
          if (progressCounter > 1) {
            pBar.value = pBar.value + 1;
            progressCounter = 0;
          }
        };
        cordova.plugins.sqlitePorter.importJsonToDb(db, json, {
          successFn: successFn,
          errorFn: errorFn,
          progressFn: progressFn1,
        });
        cordova.plugins.sqlitePorter.importJsonToDb(db, json2, {
          successFn: successFn2,
          errorFn: errorFn,
          progressFn: progressFn2,
        });
        return deferred.promise;
      };
      self.getPosts = function (dateLastUpdated) {
        var deferred = $q.defer(),
          //  url = 'http://lyticom.com/kmos/wp-json/wp/v2/posts?filter[date_query][0][column]=post_modified_gmt&filter[date_query][0][after]=2017-08-03';
          url = "http://k-mos.com/?page_id=11981&date=" + dateLastUpdated;
        url = url.replace(/ /g, "%20");
        console.log(url);

        $http.get(url).then(function (response) {
          //var jsonData = data;
          //console.log('headers '+headers);
          deferred.resolve(response);
        });

        return deferred.promise;
      };

      // Edit 11-11-18 - add indirect tax acts
      self.getVATPosts = function (dateLastUpdated) {
        var deferred = $q.defer(),
          //  url = 'http://lyticom.com/kmos/wp-json/wp/v2/posts?filter[date_query][0][column]=post_modified_gmt&filter[date_query][0][after]=2017-08-03';
          url = "http://k-mos.com/?page_id=14166";
        url = url.replace(/ /g, "%20");
        console.log(url);

        $http.get(url).then(function (response) {
          //var jsonData = data;
          //console.log('headers '+headers);
          deferred.resolve(response);
        });

        return deferred.promise;
      };
      self.getPdfFileUrl = function () {
        var deferred = $q.defer(),
          //  url = 'http://lyticom.com/kmos/wp-json/wp/v2/posts?filter[date_query][0][column]=post_modified_gmt&filter[date_query][0][after]=2017-08-03';
          url = "http://k-mos.com/?page_id=19978";
        //url = url.replace(/ /g,"%20");
        console.log(url);

        $http.get(url).then(function (response) {
          //var jsonData = data;
          //console.log('headers '+headers);
          deferred.resolve(response);
        });

        return deferred.promise;
      };

      self.getRemotePdfModifiedDate = function () {
        var deferred = $q.defer(),
          //  url = 'http://lyticom.com/kmos/wp-json/wp/v2/posts?filter[date_query][0][column]=post_modified_gmt&filter[date_query][0][after]=2017-08-03';
          url = "http://k-mos.com/?page_id=19981";
        //url = url.replace(/ /g,"%20");
        console.log(url);

        $http.get(url).then(function (response) {
          //var jsonData = data;
          //console.log('headers '+headers);
          deferred.resolve(response);
        });

        return deferred.promise;
      };
      // END Edit 11-11-18 - add indirect tax acts

      self.getTerms = function (dateLastUpdated) {
        var deferred = $q.defer(),
          //  url = 'http://lyticom.com/kmos/wp-json/wp/v2/posts?filter[date_query][0][column]=post_modified_gmt&filter[date_query][0][after]=2017-08-03';
          url = "http://k-mos.com/?page_id=11988";
        //url = url.replace(/ /g,"%20");
        console.log(url);

        $http.get(url).then(function (response) {
          //var jsonData = data;
          //console.log('headers '+headers);
          deferred.resolve(response);
        });

        return deferred.promise;
      };
      self.getTermTaxonomy = function (dateLastUpdated) {
        var deferred = $q.defer(),
          //  url = 'http://lyticom.com/kmos/wp-json/wp/v2/posts?filter[date_query][0][column]=post_modified_gmt&filter[date_query][0][after]=2017-08-03';
          url = "http://k-mos.com/?page_id=11990";
        //url = url.replace(/ /g,"%20");
        console.log(url);

        $http.get(url).then(function (response) {
          //var jsonData = data;
          //console.log('headers '+headers);
          deferred.resolve(response);
        });

        return deferred.promise;
      };
      self.getTermRelationships = function () {
        var deferred = $q.defer(),
          //  url = 'http://lyticom.com/kmos/wp-json/wp/v2/posts?filter[date_query][0][column]=post_modified_gmt&filter[date_query][0][after]=2017-08-03';
          url = "http://k-mos.com/?page_id=11992";
        //url = url.replace(/ /g,"%20");
        console.log(url);

        $http.get(url).then(function (response) {
          //var jsonData = data;
          //console.log('headers '+headers);
          deferred.resolve(response);
        });

        return deferred.promise;
      };
      self.getAmmendments = function () {
        var deferred = $q.defer(),
          //  url = 'http://lyticom.com/kmos/wp-json/wp/v2/posts?filter[date_query][0][column]=post_modified_gmt&filter[date_query][0][after]=2017-08-03';
          url = "http://k-mos.com/?page_id=12078";
        //url = url.replace(/ /g,"%20");
        console.log(url);

        $http.get(url).then(function (response) {
          //var jsonData = data;
          //console.log('headers '+headers);
          deferred.resolve(response);
        });

        return deferred.promise;
      };
      self.getCorporateEmail = function (email) {
        var deferred = $q.defer(),
          //  url = 'http://lyticom.com/kmos/wp-json/wp/v2/posts?filter[date_query][0][column]=post_modified_gmt&filter[date_query][0][after]=2017-08-03';
          url = "http://k-mos.com/?page_id=13924&email=" + email;
        //url = url.replace(/ /g,"%20");
        console.log(url);

        $http.get(url).then(function (response) {
          //var jsonData = data;
          //console.log('headers '+headers);
          deferred.resolve(response);
        });

        return deferred.promise;
      };
      self.postEmail = function (userName, userEmail) {
        var currentDate = dateService.currentDate();
        var postData = {
          name: userName,
          email: userEmail,
          other: "other stuff",
          date: currentDate,
        };
        postData = JSON.stringify(postData);
        var deferred = $q.defer(),
          //  url = 'http://lyticom.com/kmos/wp-json/wp/v2/posts?filter[date_query][0][column]=post_modified_gmt&filter[date_query][0][after]=2017-08-03';
          url = "http://k-mos.com/?page_id=12663";
        //url = url.replace(/ /g,"%20");
        console.log(url);

        $http
          .post(url, postData, {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
          })
          .then(function (response) {
            //var jsonData = data;
            //console.log('headers '+headers);
            deferred.resolve(response);
          });

        return deferred.promise;
      };
      self.getRemoteTrial = function () {
        const deviceId = device.uuid;
        var deferred = $q.defer(),
          url = "http://k-mos.com/?page_id=23701&device_id=" + deviceId;

        console.log(url);

        $http.get(url).then(function (response) {
          //var jsonData = data;
          //console.log('headers '+headers);
          deferred.resolve(response);
        });

        return deferred.promise;
      };
      self.postTrial = function () {
        const deviceId = device.uuid;
        var postData = {
          device_id: deviceId,
        };
        postData = JSON.stringify(postData);
        var deferred = $q.defer(),
          url = "http://k-mos.com/?page_id=23699";

        console.log(url);

        $http
          .post(url, postData, {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
          })
          .then(function (response) {
            deferred.resolve(response);
          });

        return deferred.promise;
      };
      self.updateCorporateLicenses = function (
        userEmail,
        userLicenses,
        subscriptionType
      ) {
        var currentDate = dateService.currentDate();
        var postData = {
          email: userEmail,
          licenses: userLicenses,
          subscription_type: subscriptionType,
          date_registered: currentDate,
        };
        postData = JSON.stringify(postData);
        var deferred = $q.defer(),
          //  url = 'http://lyticom.com/kmos/wp-json/wp/v2/posts?filter[date_query][0][column]=post_modified_gmt&filter[date_query][0][after]=2017-08-03';
          url = "http://k-mos.com/?page_id=13926";
        //url = url.replace(/ /g,"%20");
        console.log(url);

        $http
          .post(url, postData, {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
          })
          .then(function (response) {
            //var jsonData = data;
            //console.log('headers '+headers);
            deferred.resolve(response);
          });

        return deferred.promise;
      };
      self.insertEmailIntoLocalDB = function (email) {
        var name = "user_email";
        var parameters = [name, email];

        return DBA.query(
          "INSERT INTO  app_vars (name,value) VALUES ((?),(?))",
          parameters
        );
      };
      self.getEmailFromLocalDB = function (postID) {
        var parameters = [postID];
        return DBA.query(
          "SELECT value FROM app_vars WHERE name = 'user_email'"
        ).then(function (result) {
          return DBA.getById(result);
        });
      };
      self.insertSubscriptionIntoLocalDB = function (name = "subscription") {
        var currentDate = dateService.currentDate();
        var value = "active";
        var parameters = [name, value, currentDate];

        return DBA.query(
          "INSERT INTO  app_vars (name,value,date_modified) VALUES ((?),(?),(?))",
          parameters
        );
      };
      self.getSubscriptionsFromLocalDB = function () {
        return DBA.query(
          "SELECT id,value,name,date_modified FROM app_vars WHERE name LIKE '%subscription%' OR name LIKE '%corporate_subscription%' OR name LIKE '%trial%'"
        ).then(function (result) {
          return DBA.getAll(result);
        });
      };
      self.deleteLocalSubscription = function () {
        return DBA.query(
          "DELETE FROM app_vars WHERE name LIKE '%subscription%' OR name LIKE '%corporate_subscription%'"
        ).then(function (result) {
          return DBA.getAll(result);
        });
      };
      self.isDBSubscriptionOld = function (purchaseDate, subscriptionLength) {
        var _MS_PER_DAY = 1000 * 60 * 60 * 24;

        // a and b are javascript Date objects
        function dateDiffInDays(a, b) {
          // Discard the time and time-zone information.
          var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
          var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

          return Math.floor((utc2 - utc1) / _MS_PER_DAY);
        }
        var a = new Date(purchaseDate),
          b = new Date(dateService.currentDate()),
          difference = dateDiffInDays(a, b),
          isOld = false;

        console.log("Date difference: " + difference);
        console.log("Subscription length: " + subscriptionLength);

        if (difference >= subscriptionLength) {
          isOld = true;
        } else {
          isOld = false;
        }

        return isOld;
      };
      return self;
    }
  )
  .factory(
    "highlightService",
    function (encodeURIService, $cordovaSQLite, DBA) {
      var self = this;
      self.doGetCaretPosition = function (oField) {
        // Initialize
        var iCaretPos = 0;

        // IE Support
        if (document.selection) {
          // Set focus on the element
          oField.focus();

          // To get cursor position, get empty selection range
          var oSel = document.selection.createRange();

          // Move selection start to 0 position
          oSel.moveStart("character", -oField.value.length);

          // The caret position is selection length
          iCaretPos = oSel.text.length;
        }

        // Firefox support
        else if (oField.selectionStart || oField.selectionStart == "0")
          iCaretPos = oField.selectionStart;

        // Return results
        return iCaretPos;
      };
      self.pasteHtmlAtCaret = function (html) {
        var sel, range;
        if (window.getSelection) {
          // IE9 and non-IE
          sel = window.getSelection();
          if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();

            // Range.createContextualFragment() would be useful here but is
            // only relatively recently standardized and is not supported in
            // some browsers (IE9, for one)
            var el = document.createElement("div");
            el.innerHTML = html;
            var frag = document.createDocumentFragment(),
              node,
              lastNode;
            while ((node = el.firstChild)) {
              lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);

            // Preserve the selection
            if (lastNode) {
              range = range.cloneRange();
              range.setStartAfter(lastNode);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }
        } else if (document.selection && document.selection.type != "Control") {
          // IE < 9
          document.selection.createRange().pasteHTML(html);
        }
      };

      self.replaceAll = function (target, search, replacement) {
        return target.replace(new RegExp(search, "g"), replacement);
      };

      return self;
    }
  );
