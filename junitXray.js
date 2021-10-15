var replacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }

  var defaultOptions = {
    indent: ' ',
    enableColors: true,
    summaryTimeUnit: null,
    summaryTrendStats: null,
  }

  var forEach = function (obj, callback) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (callback(key, obj[key])) {
          break
        }
      }
    }
  }
  
  function escapeHTML(str) {
    // TODO: something more robust?
    return str.replace(/[&<>'"]/g, function (char) {
      return replacements[char]
    })
  }

  function getMetricValue(metric, thresholdName, options){
    var mymessage = ''

      if (metric.type == 'trend'){
        for (var i = 0; i < options.summaryTrendStats.length; i++) {
          var tc = options.summaryTrendStats[i]
          var value = metric.values[tc]
          if (tc === 'count') {
            mymessage = value.toString()
          } else {
            var myThreshold = thresholdName.split(/[>|<|=]/);
            mymessage = metric.values[myThreshold[0]];
          }
        }
      } else if (metric.type == 'gauge'){
        mymessage = parseFloat(metric.values.value).toFixed(6).toString();
      } else if (metric.type == 'rate'){
        mymessage = (Math.trunc(metric.values.rate * 100 * 100) / 100).toFixed(2) + '%';
      } else if (metric.type == 'counter'){
        mymessage = metric.values.rate + '/s';
      } else {
        mymessage = metric.type;
      }

    return mymessage;
  }
  
  function addEvidence(fileName, fileEvidence){
    var item = '';
    if(fileName && fileEvidence){
      item = '<item name="'+ fileName +'">' +
      fileEvidence +
      '</item>';
    }

    return item;
  }

  export function generateXrayJUnitXML(data, fileName='', fileContent='', options) {
    var failures = 0
    var cases = []
    var mergedOpts = Object.assign({}, defaultOptions, data.options, options);

    forEach(data.metrics, function (metricName, metric) {
      if (!metric.thresholds) {
        return
      }
      forEach(metric.thresholds, function (thresholdName, threshold) {
        if (threshold.ok) {
          cases.push(
            '<testcase name="' + escapeHTML(metricName) + ' - ' + escapeHTML(thresholdName) + '">' + 
            '<system-out><![CDATA[Value registered for ' + metricName + ' is within the expected values('+ thresholdName +'). Actual values: '+ metricName +' = ' + getMetricValue(metric, thresholdName, mergedOpts)+ ']]></system-out>' +
            '<properties>' +
                '<property name="testrun_comment"><![CDATA[Value registered for ' + metricName + ' is within the expected values- ' + thresholdName + ']]></property>' +
                '<property name="test_description"><![CDATA[Threshold for '+ metricName +']]></property>' +
                '<property name="test_summary" value="' + escapeHTML(metricName) + ' - ' + escapeHTML(thresholdName) + '"/>' +
              '</properties>' +
            '</testcase>'
          )
        } else {
          failures++
          cases.push(
            '<testcase name="' + escapeHTML(metricName) + ' - ' + escapeHTML(thresholdName) +'">' +
              '<failure message="Value registered for ' + metricName + ' is not within the expected values('+ escapeHTML(thresholdName) +'). Actual values: '+ escapeHTML(metricName) +' = ' + getMetricValue(metric, thresholdName, mergedOpts) +'" />' +  
              '<properties>' +
                '<property name="testrun_comment"><![CDATA[Value registered for ' + metricName + ' is not within the expected values - '+ thresholdName + ']]></property>' +
                '<property name="test_description"><![CDATA[Threshold for '+ metricName +']]></property>' +
                '<property name="test_summary" value="' + escapeHTML(metricName) + ' - ' + escapeHTML(thresholdName) + '"/>' +
                '<property name="testrun_evidence">' +
                addEvidence(fileName, fileContent) + 
                '</property>' +
              '</properties>' +
            '</testcase>'
          )
        }
      })
    })
  
    var name = options && options.name ? escapeHTML(options.name) : 'k6 thresholds'
  
    return (
      '<?xml version="1.0"?>\n<testsuites tests="' +
      cases.length +
      '" failures="' +
      failures +
      '">\n' +
      '<testsuite name="' +
      name +
      '" tests="' +
      cases.length +
      '" failures="' +
      failures +
      '">' +
      cases.join('\n') +
      '\n</testsuite >\n</testsuites >'
    )
  }