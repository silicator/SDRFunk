// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var url;
var incognito;
var activeTabId;

chrome.tabs.onActivated.addListener(function(activeInfo){activeTabId = activeInfo.tabId;});

function settingChanged()
{
  var type = this.id;
  var setting = this.value;
  var pattern = /^file:/.test(url) ? url : url.replace(/\/[^\/]*?$/, '/*');
  console.log(type+' setting for '+pattern+': '+setting);
  // HACK: [type] is not recognised by the doc server's sample crawler,
  // mention an explicit so type: 
  // chrome.contentSettings.cookies.set - See http://crbug.com/299634
  chrome.contentSettings[type].set({
        'primaryPattern': pattern,
        'setting': setting,
        'scope': (incognito ? 'incognito_session_only' : 'regular')
      });
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({active: true, currentWindow: true},
	function(tabs)
	{
    var current = tabs[0];
    incognito = current.incognito;
    url = current.url;
    var types = [ 'background','images', 'javascript', 'location', 'plugins',
                  'notifications', 'microphone', 'camera',
                  'unsandboxedPlugins', 'automaticDownloads'];
    types.forEach(function(type)
	 {
      // chrome.contentSettings.cookies.get - See http://crbug.com/299634
      chrome.contentSettings[type] && chrome.contentSettings[type].get({
            'primaryUrl': url,
            'incognito': incognito
          },
          function(details)
		  {
            document.getElementById(type).disabled = false;
            document.getElementById(type).value = details.setting;
          });
     });
    });

  var selects = document.querySelectorAll('select');
  for (var i = 0; i < selects.length; i++)
  {
    selects[i].addEventListener('change', settingChanged);
  }
});
