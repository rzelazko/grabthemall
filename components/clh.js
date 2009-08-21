const nsISupports              = Components.interfaces.nsISupports;

const nsICategoryManager       = Components.interfaces.nsICategoryManager;
const nsIComponentRegistrar    = Components.interfaces.nsIComponentRegistrar;
const nsICommandLine           = Components.interfaces.nsICommandLine;
const nsICommandLineHandler    = Components.interfaces.nsICommandLineHandler;
const nsIFactory               = Components.interfaces.nsIFactory;
const nsIModule                = Components.interfaces.nsIModule;

const CLASS_ID = Components.ID("178cfbb6-503c-11dc-8314-0800200c9a66");
const CLASS_NAME = "ApplicationNameCLH";
const CONTRACT_ID = "@example.com/applicationname/clh;1";
const CLD_CATEGORY = "m-applicationname";

var appHandler = {
  /* nsISupports */
  QueryInterface : function clh_QI(aIID)
  {
    if (aIID.equals(nsICommandLineHandler) ||
        aIID.equals(nsIFactory) ||
        aIID.equals(nsISupports))
      return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  /* nsICommandLineHandler */
  handle : function clh_handle(aCmdLine)
  {
    var observerService = Components.classes["@mozilla.org/observer-service;1"]
                                    .getService(Components.interfaces.nsIObserverService);
    observerService.notifyObservers(aCmdLine, "commandline-args-changed", null);
  },

  helpInfo : 
    " -url-list <file>        Path to file with URL list\n" + 
    " -one-url <url>          Single url to take screenshot\n" +
    " -save-to-dir <dir>      Path to directory with screenshots\n",

  /* nsIFactory */
  createInstance : function mdh_CI(aOuter, aIID)
  {
    if (aOuter != null) {
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    }

    return this.QueryInterface(aIID);
  },

  lockFactory : function mdh_lock(aLock)
  {
    /* no-op */
  }
};

var appHandlerModule = {
  /* nsISupports */
  QueryInterface : function mod_QI(aIID)
  {
    if (aIID.equals(nsIModule) ||
        aIID.equals(nsISupports))
      return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  /* nsIModule */
  getClassObject : function mod_gch(aCompMgr, aCID, aIID)
  {
    if (aCID.equals(CLASS_ID))
      return appHandler.QueryInterface(aIID);

    throw components.results.NS_ERROR_FAILURE;
  },

  registerSelf : function mod_regself(aCompMgr, aFileSpec, aLocation, aType)
  {
    var compReg = aCompMgr.QueryInterface(nsIComponentRegistrar);

    compReg.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID,
                                    aFileSpec, aLocation, aType);

    var catMan = Components.classes["@mozilla.org/categorymanager;1"]
                           .getService(nsICategoryManager);
    catMan.addCategoryEntry("command-line-handler",
                            CLD_CATEGORY, CONTRACT_ID, true, true);
  },

  unregisterSelf : function mod_unreg(aCompMgr, aLocation, aType)
  {
    var compReg = aCompMgr.QueryInterface(nsIComponentRegistrar);
    compReg.unregisterFactoryLocation(CLASS_ID, aLocation);

    var catMan = Components.classes["@mozilla.org/categorymanager;1"]
                           .getService(nsICategoryManager);
    catMan.deleteCategoryEntry("command-line-handler", CLD_CATEGORY);
  },

  canUnload : function (aCompMgr)
  {
    return true;
  }
};

function NSGetModule(aCompMgr, aFileSpec)
{
  return appHandlerModule;
}
