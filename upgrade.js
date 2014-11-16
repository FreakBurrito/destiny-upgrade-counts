// Generated by CoffeeScript 1.8.0
(function() {
  var Item, Totals, Upgrader, colors,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Item = (function() {
    function Item(data) {
      ko.mapping.fromJS(data, {}, this);
      this.material_list = ko.computed((function(_this) {
        return function() {
          var list, material, talentNodes, _i, _j, _len, _len1, _ref, _ref1;
          list = [];
          _ref = _this.json["Response"]["data"]["talentNodes"]();
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            talentNodes = _ref[_i];
            _ref1 = talentNodes.materialsToUpgrade();
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              material = _ref1[_j];
              material["name"] = _this.json["Response"]["definitions"]["items"][material.itemHash()]["itemName"]();
              list.push(material);
            }
          }
          return list;
        };
      })(this));
      this.materials = ko.computed((function(_this) {
        return function() {
          var group;
          group = _this.group_by(_this.material_list(), "name");
          return group;
        };
      })(this));
      this.material_names = ko.computed((function(_this) {
        return function() {
          var clean_list, m, ms, name, total, _i, _len, _ref;
          clean_list = {};
          _ref = _this.materials();
          for (name in _ref) {
            ms = _ref[name];
            total = 0;
            for (_i = 0, _len = ms.length; _i < _len; _i++) {
              m = ms[_i];
              total = total + m.count();
            }
            clean_list[name] = total;
          }
          return clean_list;
        };
      })(this));
      this.material_array = ko.computed((function(_this) {
        return function() {
          var array, name, total;
          array = (function() {
            var _ref, _results;
            _ref = this.material_names();
            _results = [];
            for (name in _ref) {
              total = _ref[name];
              _results.push({
                name: name,
                total: total
              });
            }
            return _results;
          }).call(_this);
          return array;
        };
      })(this));
    }

    Item.prototype.group_by = function(array, key) {
      var item, items, _i, _len, _name;
      items = {};
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        item = array[_i];
        if (item[key]) {
          (items[_name = item[key]] || (items[_name] = [])).push(item);
        }
      }
      return items;
    };

    Item.prototype.displayName = function() {
      var name;
      name = "" + (this.data.itemName()) + ": " + (this.bucket.bucketName());
      if (this.vault()) {
        name += " Vault";
      }
      return name;
    };

    Item.prototype.check_vault = function() {
      return !this.vault();
    };

    Item.prototype.materialsByTier = function() {
      var hash, item, materialByTier, _i, _len, _name, _ref;
      materialByTier = {};
      _ref = this.json.Response.data.materialItemHashes();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        hash = _ref[_i];
        item = this.json.Response.definitions.items[hash];
        materialByTier[_name = item.tierTypeName()] || (materialByTier[_name] = []);
        materialByTier[item.tierTypeName()].push(item.itemName());
      }
      return materialByTier;
    };

    Item.prototype.csv = function(stats_header, material_names) {
      var count, found_stat, instace_stat, item_csv, mat_data, name, perk, perk_string, stat, stat_csv, string, _i, _j, _k, _len, _len1, _len2, _ref;
      item_csv = [this.data.itemName(), this.data.itemTypeName(), this.data.tierTypeName(), this.data.qualityLevel()];
      stat_csv = [];
      for (_i = 0, _len = stats_header.length; _i < _len; _i++) {
        stat = stats_header[_i];
        found_stat = ((function() {
          var _j, _len1, _ref, _results;
          _ref = this.instance.stats();
          _results = [];
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            instace_stat = _ref[_j];
            if (instace_stat.statHash() === stat) {
              _results.push(instace_stat);
            }
          }
          return _results;
        }).call(this))[0];
        if (found_stat) {
          stat_csv[stats_header.indexOf(stat)] = found_stat.value();
        } else {
          stat_csv[stats_header.indexOf(stat)] = "";
        }
      }
      perk_string = "";
      _ref = this.instance.perks();
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        perk = _ref[_j];
        perk_string += "" + (this.json.Response.definitions.perks[perk.perkHash()].displayName()) + "\n";
      }
      mat_data = [];
      for (_k = 0, _len2 = material_names.length; _k < _len2; _k++) {
        name = material_names[_k];
        count = 0;
        if (this.material_names[name]) {
          count = this.material_names[name]();
        }
        mat_data.push(count);
      }
      string = item_csv.concat(stat_csv, ["\"" + perk_string + "\""], mat_data).join();
      return string;
    };

    return Item;

  })();

  Totals = (function() {
    function Totals() {
      this.add = __bind(this.add, this);
      this.count = __bind(this.count, this);
      this.names = ko.observableArray([]);
      this.list = ko.computed((function(_this) {
        return function() {
          var name, _i, _len, _ref, _results;
          _ref = _this.names();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            name = _ref[_i];
            _results.push([name, _this[name]()]);
          }
          return _results;
        };
      })(this));
    }

    Totals.prototype.count = function(name) {
      if (this[name]) {
        return this[name]();
      } else {
        return 0;
      }
    };

    Totals.prototype.add = function(name, count) {
      if (this[name]) {
        return this[name](this[name]() + count);
      } else {
        this[name] = ko.observable(count);
        return this.names.push(name);
      }
    };

    return Totals;

  })();

  Upgrader = (function() {
    Upgrader.prototype.baseInventoryUrl = window.location.protocol + "//www.bungie.net/Platform/Destiny/1/Account/ACCOUNT_ID_SUB/Character/CHARACTER_ID_SUB/Inventory/IIID_SUB/?lc=en&fmt=true&lcin=true&definitions=true";

    Upgrader.prototype.vaultInventoryUrl = window.location.protocol + "//www.bungie.net/Platform/Destiny/1/MyAccount/Character/CHARACTER_ID_SUB/Vendor/VENDOR_ID/?lc=en&fmt=true&lcin=true&definitions=true";

    function Upgrader() {
      this.addItem = __bind(this.addItem, this);
      var error;
      this.accountID = null;
      this.characterID = null;
      this.items = ko.observableArray();
      this.totals = ko.computed((function(_this) {
        return function() {
          var count, item, name, total, _i, _len, _ref, _ref1;
          total = new Totals;
          _ref = _this.items();
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            if (_this.displayVault() || !item.vault()) {
              _ref1 = item.material_names();
              for (name in _ref1) {
                count = _ref1[name];
                total.add(name, count);
              }
            }
          }
          return total;
        };
      })(this));
      this.ownedTotals = new Totals;
      this.setIDs();
      this.vaultLoaded = ko.observable(false);
      this.displayVault = ko.observable(false);
      this.error = ko.observable(false);
      try {
        this.processItems();
        this.venderTimeout = setInterval((function(_this) {
          return function() {
            return _this.processVault();
          };
        })(this), 600);
      } catch (_error) {
        error = _error;
        this.error("There was a problem loading the site: " + error);
      }
      this.itemsCSV = ko.computed((function(_this) {
        return function() {
          var csv, data, header, id, item, mat_names, stats_header, _i, _len, _ref, _ref1;
          header = ["Name", "Type", "Tier", "Quality Level"];
          stats_header = [];
          _ref = DEFS.stats;
          for (id in _ref) {
            data = _ref[id];
            stats_header.push(parseInt(id, 10));
            header.push(data.statName);
          }
          mat_names = _this.total_object().names();
          header.push("Perks");
          header = header.concat(mat_names);
          csv = [header.join()];
          _ref1 = _this.items();
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            item = _ref1[_i];
            if (["BUCKET_SPECIAL_WEAPON", "BUCKET_HEAVY_WEAPON", "BUCKET_PRIMARY_WEAPON"].indexOf(item.bucket.bucketIdentifier()) >= 0) {
              csv.push(item.csv(stats_header, mat_names));
            }
          }
          return csv.join("\n");
        };
      })(this));
    }

    Upgrader.prototype.total_object = function() {
      return this.totals();
    };

    Upgrader.prototype.processVault = function() {
      var id, obj, url, vendor_id, _ref;
      vendor_id = null;
      if (DEFS.vendorDetails) {
        _ref = DEFS.vendorDetails;
        for (id in _ref) {
          obj = _ref[id];
          vendor_id = id;
        }
      }
      if (vendor_id) {
        clearInterval(this.venderTimeout);
        this.vaultLoaded(true);
        url = this.vaultInventoryUrl.replace("CHARACTER_ID_SUB", this.characterID).replace("VENDOR_ID", vendor_id);
        return $.ajax({
          url: url,
          type: "GET",
          beforeSend: function(xhr) {
            var key, value, _ref1, _results;
            xhr.setRequestHeader('Accept', "application/json, text/javascript, */*; q=0.01");
            _ref1 = bungieNetPlatform.getHeaders();
            _results = [];
            for (key in _ref1) {
              value = _ref1[key];
              _results.push(xhr.setRequestHeader(key, value));
            }
            return _results;
          }
        }).done((function(_this) {
          return function(item_json) {
            var bucket, datas, item, _i, _len, _ref1, _results;
            _ref1 = item_json["Response"]["data"]["inventoryBuckets"];
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              bucket = _ref1[_i];
              _results.push((function() {
                var _j, _len1, _ref2, _results1;
                _ref2 = bucket.items;
                _results1 = [];
                for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                  item = _ref2[_j];
                  datas = item_json["Response"]["definitions"]["items"][item.itemHash];
                  if (this.ownedTotals[datas.itemName]) {
                    this.ownedTotals.add(datas.itemName, item.stackSize);
                  }
                  _results1.push(this.addItem(item.itemInstanceId, {
                    "vault": true,
                    "data": datas,
                    "instance": item,
                    "bucket": item_json["Response"]["definitions"]["buckets"][bucket.bucketHash]
                  }));
                }
                return _results1;
              }).call(_this));
            }
            return _results;
          };
        })(this));
      } else {

      }
    };

    Upgrader.prototype.processItems = function() {
      var bucket, data, item, name, object, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
      _ref = tempModel.inventory.buckets.Equippable;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _ref1 = item.items;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          object = _ref1[_j];
          data = DEFS["items"][object.itemHash];
          this.addItem(object.itemInstanceId, {
            "vault": false,
            "instance": object,
            "data": data,
            "bucket": DEFS['buckets'][data.bucketTypeHash]
          });
        }
      }
      _ref2 = tempModel.inventory.buckets.Item;
      _results = [];
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        bucket = _ref2[_k];
        if (DEFS.buckets[bucket.bucketHash].bucketIdentifier === "BUCKET_MATERIALS") {
          _results.push((function() {
            var _l, _len3, _ref3, _results1;
            _ref3 = bucket.items;
            _results1 = [];
            for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
              item = _ref3[_l];
              name = DEFS["items"][item.itemHash].itemName;
              _results1.push(this.ownedTotals.add(name, item.stackSize));
            }
            return _results1;
          }).call(this));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Upgrader.prototype.setIDs = function() {
      var matches;
      matches = window.location.pathname.match(/(.+)\/(\d+)\/(\d+)/);
      this.accountID = matches[2];
      return this.characterID = matches[3];
    };

    Upgrader.prototype.addItem = function(iiid, base_object) {
      var url;
      url = this.baseInventoryUrl.replace("ACCOUNT_ID_SUB", this.accountID).replace("CHARACTER_ID_SUB", this.characterID).replace("IIID_SUB", iiid);
      return $.ajax({
        url: url,
        type: "GET",
        beforeSend: function(xhr) {
          var key, value, _ref, _results;
          xhr.setRequestHeader('Accept', "application/json, text/javascript, */*; q=0.01");
          _ref = bungieNetPlatform.getHeaders();
          _results = [];
          for (key in _ref) {
            value = _ref[key];
            _results.push(xhr.setRequestHeader(key, value));
          }
          return _results;
        }
      }).done((function(_this) {
        return function(item_json) {
          base_object["json"] = item_json;
          return _this.items.push(new Item(base_object));
        };
      })(this));
    };

    return Upgrader;

  })();

  window.upgrader = new Upgrader;

  if (!$('.upgrader')[0]) {
    colors = {
      primary: '#21252B',
      secondary: '#2D3137',
      tertiary: '#393F45'
    };
    $(".nav_top").append("<style> .upgrader { width: 300px; min-height: 10px; max-height: 550px; clear: left; background-color: " + colors.primary + "; color: #fff; padding: 0 .5em; overflow-x: auto; border-bottom: " + colors.primary + " solid 1px; border-radius: 0 0 0 5px; } .upgrader .header { height: 20px; padding: .5em 0; } .upgrader .header span { cursor: pointer; float: left; } .upgrader .header label { float: right; } .upgrader .totals { background: " + colors.secondary + "; border-radius: 5px; padding: .5em; } .upgrader .item { background: " + colors.secondary + "; border-radius: 5px; margin:.5em 0; } .upgrader .item span { padding: .25em .5em; display: inline-block; } .upgrader .item ul { background: " + colors.tertiary + "; border-radius: 0 0 5px 5px; padding:.25em .5em; } </style> <li class='upgrader'> <div class='header'> <!-- ko ifnot: error --> <span onclick='$(\"#upgrader-data\").toggle();return false;'> UPGRADES </span> <label> <input type='checkbox' data-bind='checked: displayVault, attr: {disabled: !vaultLoaded()}' /> <!-- ko ifnot: vaultLoaded()--> Click Gear for Vault <!-- /ko --> <!-- ko if: vaultLoaded()--> Include Vault <!-- /ko --> </label> <!-- /ko --> <!-- ko if: error --> <span data-bind='text: error'></span> <!-- /ko --> </div> <span id='upgrader-data' data-bind='ifnot: error'> <ul> <li class='item'> <span>Total counts(owned)</span> <ul class='totals' data-bind='foreach: totals().list()'> <li data-bind=\"text: $data[0]+': '+$data[1]+'('+$parent.ownedTotals.count($data[0])+')'\"></li> </ul> </li> </ul> <ul class='item-totals' data-bind='foreach: items'> <!-- ko if:(material_array()[0] && ($parent.displayVault() || !vault())) --> <li class='item'> <span data-bind='text: displayName()'></span> <ul data-bind='foreach: material_array()'> <li data-bind=\"text: name+': '+total\"></li> </ul> </li> <!-- /ko --> </ul> <span onclick='$(\"#upgrader-data\").hide();$(\"#itemsCSV\").show();return false;'> CSV -> </span> </span> <span id='itemsCSV'> <span onclick='$(\"#upgrader-data\").show();$(\"#itemsCSV\").hide();return false;'> <- Back to Display </span> <pre data-bind='text: itemsCSV()'></pre> </span> </li>");
    $('#itemsCSV').hide();
    ko.applyBindings(window.upgrader, $('.upgrader')[0]);
  }

}).call(this);
