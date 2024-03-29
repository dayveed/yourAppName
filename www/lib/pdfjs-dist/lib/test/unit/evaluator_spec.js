/* Copyright 2017 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var _primitives = require('../../core/primitives');

var _evaluator = require('../../core/evaluator');

var _stream = require('../../core/stream');

var _util = require('../../shared/util');

var _worker = require('../../core/worker');

describe('evaluator', function () {
  function XrefMock(queue) {
    this.queue = queue || [];
  }
  XrefMock.prototype = {
    fetchIfRef: function fetchIfRef() {
      return this.queue.shift();
    }
  };
  function HandlerMock() {
    this.inputs = [];
  }
  HandlerMock.prototype = {
    send: function send(name, data) {
      this.inputs.push({
        name: name,
        data: data
      });
    }
  };
  function ResourcesMock() {}
  ResourcesMock.prototype = {
    get: function get(name) {
      return this[name];
    }
  };
  function PdfManagerMock() {}
  function runOperatorListCheck(evaluator, stream, resources, callback) {
    var result = new _evaluator.OperatorList();
    var task = new _worker.WorkerTask('OperatorListCheck');
    evaluator.getOperatorList(stream, task, resources, result).then(function () {
      callback(result);
    });
  }
  describe('splitCombinedOperations', function () {
    it('should reject unknown operations', function (done) {
      var evaluator = new _evaluator.PartialEvaluator(new PdfManagerMock(), new XrefMock(), new HandlerMock(), 'prefix');
      var stream = new _stream.StringStream('fTT');
      runOperatorListCheck(evaluator, stream, new ResourcesMock(), function (result) {
        expect(!!result.fnArray && !!result.argsArray).toEqual(true);
        expect(result.fnArray.length).toEqual(1);
        expect(result.fnArray[0]).toEqual(_util.OPS.fill);
        expect(result.argsArray[0]).toEqual(null);
        done();
      });
    });
    it('should handle one operations', function (done) {
      var evaluator = new _evaluator.PartialEvaluator(new PdfManagerMock(), new XrefMock(), new HandlerMock(), 'prefix');
      var stream = new _stream.StringStream('Q');
      runOperatorListCheck(evaluator, stream, new ResourcesMock(), function (result) {
        expect(!!result.fnArray && !!result.argsArray).toEqual(true);
        expect(result.fnArray.length).toEqual(1);
        expect(result.fnArray[0]).toEqual(_util.OPS.restore);
        done();
      });
    });
    it('should handle two glued operations', function (done) {
      var evaluator = new _evaluator.PartialEvaluator(new PdfManagerMock(), new XrefMock(), new HandlerMock(), 'prefix');
      var resources = new ResourcesMock();
      resources.Res1 = {};
      var stream = new _stream.StringStream('/Res1 DoQ');
      runOperatorListCheck(evaluator, stream, resources, function (result) {
        expect(!!result.fnArray && !!result.argsArray).toEqual(true);
        expect(result.fnArray.length).toEqual(2);
        expect(result.fnArray[0]).toEqual(_util.OPS.paintXObject);
        expect(result.fnArray[1]).toEqual(_util.OPS.restore);
        done();
      });
    });
    it('should handle tree glued operations', function (done) {
      var evaluator = new _evaluator.PartialEvaluator(new PdfManagerMock(), new XrefMock(), new HandlerMock(), 'prefix');
      var stream = new _stream.StringStream('fff');
      runOperatorListCheck(evaluator, stream, new ResourcesMock(), function (result) {
        expect(!!result.fnArray && !!result.argsArray).toEqual(true);
        expect(result.fnArray.length).toEqual(3);
        expect(result.fnArray[0]).toEqual(_util.OPS.fill);
        expect(result.fnArray[1]).toEqual(_util.OPS.fill);
        expect(result.fnArray[2]).toEqual(_util.OPS.fill);
        done();
      });
    });
    it('should handle three glued operations #2', function (done) {
      var evaluator = new _evaluator.PartialEvaluator(new PdfManagerMock(), new XrefMock(), new HandlerMock(), 'prefix');
      var resources = new ResourcesMock();
      resources.Res1 = {};
      var stream = new _stream.StringStream('B*Bf*');
      runOperatorListCheck(evaluator, stream, resources, function (result) {
        expect(!!result.fnArray && !!result.argsArray).toEqual(true);
        expect(result.fnArray.length).toEqual(3);
        expect(result.fnArray[0]).toEqual(_util.OPS.eoFillStroke);
        expect(result.fnArray[1]).toEqual(_util.OPS.fillStroke);
        expect(result.fnArray[2]).toEqual(_util.OPS.eoFill);
        done();
      });
    });
    it('should handle glued operations and operands', function (done) {
      var evaluator = new _evaluator.PartialEvaluator(new PdfManagerMock(), new XrefMock(), new HandlerMock(), 'prefix');
      var stream = new _stream.StringStream('f5 Ts');
      runOperatorListCheck(evaluator, stream, new ResourcesMock(), function (result) {
        expect(!!result.fnArray && !!result.argsArray).toEqual(true);
        expect(result.fnArray.length).toEqual(2);
        expect(result.fnArray[0]).toEqual(_util.OPS.fill);
        expect(result.fnArray[1]).toEqual(_util.OPS.setTextRise);
        expect(result.argsArray.length).toEqual(2);
        expect(result.argsArray[1].length).toEqual(1);
        expect(result.argsArray[1][0]).toEqual(5);
        done();
      });
    });
    it('should handle glued operations and literals', function (done) {
      var evaluator = new _evaluator.PartialEvaluator(new PdfManagerMock(), new XrefMock(), new HandlerMock(), 'prefix');
      var stream = new _stream.StringStream('trueifalserinulln');
      runOperatorListCheck(evaluator, stream, new ResourcesMock(), function (result) {
        expect(!!result.fnArray && !!result.argsArray).toEqual(true);
        expect(result.fnArray.length).toEqual(3);
        expect(result.fnArray[0]).toEqual(_util.OPS.setFlatness);
        expect(result.fnArray[1]).toEqual(_util.OPS.setRenderingIntent);
        expect(result.fnArray[2]).toEqual(_util.OPS.endPath);
        expect(result.argsArray.length).toEqual(3);
        expect(result.argsArray[0].length).toEqual(1);
        expect(result.argsArray[0][0]).toEqual(true);
        expect(result.argsArray[1].length).toEqual(1);
        expect(result.argsArray[1][0]).toEqual(false);
        expect(result.argsArray[2]).toEqual(null);
        done();
      });
    });
  });
  describe('validateNumberOfArgs', function () {
    it('should execute if correct number of arguments', function (done) {
      var evaluator = new _evaluator.PartialEvaluator(new PdfManagerMock(), new XrefMock(), new HandlerMock(), 'prefix');
      var stream = new _stream.StringStream('5 1 d0');
      runOperatorListCheck(evaluator, stream, new ResourcesMock(), function (result) {
        expect(result.argsArray[0][0]).toEqual(5);
        expect(result.argsArray[0][1]).toEqual(1);
        expect(result.fnArray[0]).toEqual(_util.OPS.setCharWidth);
        done();
      });
    });
    it('should execute if too many arguments', function (done) {
      var evaluator = new _evaluator.PartialEvaluator(new PdfManagerMock(), new XrefMock(), new HandlerMock(), 'prefix');
      var stream = new _stream.StringStream('5 1 4 d0');
      runOperatorListCheck(evaluator, stream, new ResourcesMock(), function (result) {
        expect(result.argsArray[0][0]).toEqual(1);
        expect(result.argsArray[0][1]).toEqual(4);
        expect(result.fnArray[0]).toEqual(_util.OPS.setCharWidth);
        done();
      });
    });
    it('should execute if nested commands', function (done) {
      var evaluator = new _evaluator.PartialEvaluator(new PdfManagerMock(), new XrefMock(), new HandlerMock(), 'prefix');
      var stream = new _stream.StringStream('/F2 /GS2 gs 5.711 Tf');
      runOperatorListCheck(evaluator, stream, new ResourcesMock(), function (result) {
        expect(result.fnArray.length).toEqual(3);
        expect(result.fnArray[0]).toEqual(_util.OPS.setGState);
        expect(result.fnArray[1]).toEqual(_util.OPS.dependency);
        expect(result.fnArray[2]).toEqual(_util.OPS.setFont);
        expect(result.argsArray.length).toEqual(3);
        expect(result.argsArray[0].length).toEqual(1);
        expect(result.argsArray[1].length).toEqual(1);
        expect(result.argsArray[2].length).toEqual(2);
        done();
      });
    });
    it('should skip if too few arguments', function (done) {
      var evaluator = new _evaluator.PartialEvaluator(new PdfManagerMock(), new XrefMock(), new HandlerMock(), 'prefix');
      var stream = new _stream.StringStream('5 d0');
      runOperatorListCheck(evaluator, stream, new ResourcesMock(), function (result) {
        expect(result.argsArray).toEqual([]);
        expect(result.fnArray).toEqual([]);
        done();
      });
    });
    it('should close opened saves', function (done) {
      var evaluator = new _evaluator.PartialEvaluator(new PdfManagerMock(), new XrefMock(), new HandlerMock(), 'prefix');
      var stream = new _stream.StringStream('qq');
      runOperatorListCheck(evaluator, stream, new ResourcesMock(), function (result) {
        expect(!!result.fnArray && !!result.argsArray).toEqual(true);
        expect(result.fnArray.length).toEqual(4);
        expect(result.fnArray[0]).toEqual(_util.OPS.save);
        expect(result.fnArray[1]).toEqual(_util.OPS.save);
        expect(result.fnArray[2]).toEqual(_util.OPS.restore);
        expect(result.fnArray[3]).toEqual(_util.OPS.restore);
        done();
      });
    });
    it('should skip paintXObject if name is missing', function (done) {
      var evaluator = new _evaluator.PartialEvaluator(new PdfManagerMock(), new XrefMock(), new HandlerMock(), 'prefix');
      var stream = new _stream.StringStream('/ Do');
      runOperatorListCheck(evaluator, stream, new ResourcesMock(), function (result) {
        expect(result.argsArray).toEqual([]);
        expect(result.fnArray).toEqual([]);
        done();
      });
    });
    it('should skip paintXObject if subtype is PS', function (done) {
      var evaluator = new _evaluator.PartialEvaluator(new PdfManagerMock(), new XrefMock(), new HandlerMock(), 'prefix');
      var xobjStreamDict = new _primitives.Dict();
      xobjStreamDict.set('Subtype', _primitives.Name.get('PS'));
      var xobjStream = new _stream.Stream([], 0, 0, xobjStreamDict);
      var xobjs = new _primitives.Dict();
      xobjs.set('Res1', xobjStream);
      var resources = new _primitives.Dict();
      resources.set('XObject', xobjs);
      var stream = new _stream.StringStream('/Res1 Do');
      runOperatorListCheck(evaluator, stream, resources, function (result) {
        expect(result.argsArray).toEqual([]);
        expect(result.fnArray).toEqual([]);
        done();
      });
    });
  });
  describe('thread control', function () {
    it('should abort operator list parsing', function (done) {
      var evaluator = new _evaluator.PartialEvaluator(new PdfManagerMock(), new XrefMock(), new HandlerMock(), 'prefix');
      var stream = new _stream.StringStream('qqQQ');
      var resources = new ResourcesMock();
      var result = new _evaluator.OperatorList();
      var task = new _worker.WorkerTask('OperatorListAbort');
      task.terminate();
      evaluator.getOperatorList(stream, task, resources, result).catch(function () {
        expect(!!result.fnArray && !!result.argsArray).toEqual(true);
        expect(result.fnArray.length).toEqual(0);
        done();
      });
    });
    it('should abort text parsing parsing', function (done) {
      var resources = new ResourcesMock();
      var evaluator = new _evaluator.PartialEvaluator(new PdfManagerMock(), new XrefMock(), new HandlerMock(), 'prefix');
      var stream = new _stream.StringStream('qqQQ');
      var task = new _worker.WorkerTask('TextContentAbort');
      task.terminate();
      evaluator.getTextContent(stream, task, resources).catch(function () {
        expect(true).toEqual(true);
        done();
      });
    });
  });
  describe('operator list', function () {
    function MessageHandlerMock() {}
    MessageHandlerMock.prototype = {
      send: function send() {}
    };
    it('should get correct total length after flushing', function () {
      var operatorList = new _evaluator.OperatorList(null, new MessageHandlerMock());
      operatorList.addOp(_util.OPS.save, null);
      operatorList.addOp(_util.OPS.restore, null);
      expect(operatorList.totalLength).toEqual(2);
      expect(operatorList.length).toEqual(2);
      operatorList.flush();
      expect(operatorList.totalLength).toEqual(2);
      expect(operatorList.length).toEqual(0);
    });
  });
});