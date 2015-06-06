;
var fileCache = {};
function filter(list, callback) {
    var result = [];
    var len = list.length;
    for (var i = 0; i < len; i++) {
        if (callback(list[i])) {
            result.push(list[i]);
        }
    }
    return result;
}
function isFunction(obj) {
    return typeof obj == 'function' || false;
}
/**
  Maybe type in the spirit of Haskell to indicate nullable types. Though, not quite as cool as Haskell.
*/
var Maybe = (function () {
    function Maybe(value) {
        if (value === void 0) { value = undefined; }
        this.hasValue = false;
        this.value = value;
    }
    Object.defineProperty(Maybe.prototype, "value", {
        get: function () {
            if (this.hasValue) {
                return this._value;
            }
            console.error("asked for value of Maybe without a value");
        },
        set: function (value) {
            this._value = value;
            this.hasValue = value !== undefined;
        },
        enumerable: true,
        configurable: true
    });
    return Maybe;
})();
/**
  Simple wrapper for objects that adds some event listening capabilities. Any getter/setter
  pairs defined on an inheriting object will automatically trigger events on that object when used.
*/
var Base = (function () {
    function Base() {
        this.listeners = {};
        this._props = undefined;
        var proto = Object.getPrototypeOf(this);
        while (proto.constructor !== Base && !Base.overridden[Base.fullyQualifiedName(proto)]) {
            this.overrideProperties(proto);
            proto = Object.getPrototypeOf(proto);
        }
        this.bindEverything();
    }
    Base.fullyQualifiedName = function (proto) {
        var names = [];
        while (proto.constructor !== Base) {
            names.push(proto.constructor.name);
            proto = Object.getPrototypeOf(proto);
        }
        return names.join("#");
    };
    Base.prototype.isNetworkProperty = function (proto, name) {
        var pd = Object.getOwnPropertyDescriptor(proto, name);
        return pd != undefined && pd.get != undefined;
    };
    Base.prototype.props = function () {
        var _this = this;
        if (this._props === undefined) {
            var proto = Object.getPrototypeOf(this);
            this._props = [];
            while (proto.constructor !== Base) {
                var networkProps = filter(Object.getOwnPropertyNames(proto), function (name) { return _this.isNetworkProperty(proto, name); });
                this._props = this._props.concat(networkProps);
                proto = Object.getPrototypeOf(proto);
            }
        }
        return this._props;
    };
    Base.prototype.overrideProperties = function (proto) {
        Base.overridden[Base.fullyQualifiedName(proto)] = true;
        // TODO: Object.getOwnPropertyNames()
        for (var accessorName in this) {
            var pd = Object.getOwnPropertyDescriptor(proto, accessorName);
            // Is this a getter + setter?
            if (pd && pd.get) {
                this.overrideSetterGetter(pd, accessorName, proto);
            }
        }
    };
    Base.prototype.toJSON = function () {
        var result = {};
        var props = this.props();
        for (var i = 0; i < props.length; i++) {
            var key = props[i];
            result[key] = this[key];
        }
        return result;
    };
    Base.prototype.bindEverything = function () {
        var fns = [];
        for (var prop in this) {
            if (isFunction(this[prop]) && !(prop in Base.prototype)) {
                fns.push(prop);
            }
        }
        if (fns.length > 0) {
            for (var i = 0; i < fns.length; i++) {
                this[fns[i]] = this[fns[i]].bind(this);
            }
        }
    };
    /**
      Override any getter/setter pairs with additional functionality: they will now trigger
      events when used.
    */
    Base.prototype.overrideSetterGetter = function (pd, accessorName, proto) {
        // overrwrite property getters with our own
        Object.defineProperty(proto, accessorName, {
            get: pd.get,
            set: function (val) {
                pd.set.bind(this)(val);
                this.trigger('change');
                this.trigger('change:' + accessorName);
                this.trigger('change:' + accessorName + ':' + val);
            },
            enumerable: true,
            configurable: true
        });
    };
    /**
      Trigger an event on this object, optionally passing in additional arguments to
      any callback functions.
    */
    Base.prototype.trigger = function (eventName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var listenerList = this.listeners[eventName];
        if (!listenerList)
            return;
        for (var i = 0; i < listenerList.length; i++) {
            listenerList[i].apply(this, args);
        }
    };
    Base.prototype.listenToHelper = function (target, eventName, callback, once) {
        var _this = this;
        if (eventName.indexOf("&&") !== -1) {
            var split = eventName.split("&&");
            var condition = split[1];
            eventName = split[0];
        }
        var listenerList = target.listeners[eventName];
        if (!listenerList)
            target.listeners[eventName] = [];
        var removeCB;
        var modifiedCallback = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if ((condition && target[condition]) || !condition) {
                callback.apply(_this, args);
                if (once)
                    removeCB();
            }
        };
        removeCB = function () {
            var idx = target.listeners[eventName].indexOf(modifiedCallback);
            target.listeners[eventName].splice(idx, 1);
        };
        target.listeners[eventName].push(modifiedCallback);
    };
    /**
      Listen to some event `eventName` on `target`, calling `callback` when it is fired.
  
      Appending && and a condition to the end of `eventName` will only trigger `callback` if
      target.condition is true.
    */
    Base.prototype.listenTo = function (target, eventName, callback) {
        if (!target)
            throw "target doesn't exist!";
        this.listenToHelper(target, eventName, callback, false);
    };
    /**
      Listen to some event `eventName` on `target`, calling `callback` when it is fired, and
      then removing this callback.
  
      Appending && and a condition to the end of `eventName` will only trigger `callback` if
      target.condition is true.
    */
    Base.prototype.listenToOnce = function (target, eventName, callback) {
        if (!target)
            throw "target doesn't exist!";
        this.listenToHelper(target, eventName, callback, true);
    };
    Base.overridden = {};
    return Base;
})();
