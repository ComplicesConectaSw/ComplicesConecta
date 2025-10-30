/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['ComplicesConecta'],
  /**
   * Your New Relic license key.
   */
  license_key: '6f647c9c6eaa46100c049ab77e900462FFFFNRAL',
  /**
   * This setting controls distributed tracing.
   * Distributed tracing lets you see the path that a request takes through your
   * distributed system. Enabling distributed tracing changes the behavior of some
   * New Relic features, so carefully consult the transition guide before you enable
   * this feature: https://docs.newrelic.com/docs/transition-guide-distributed-tracing
   * Default is true.
   */
  distributed_tracing: {
    /**
     * Enables/disables distributed tracing.
     *
     * @env NEW_RELIC_DISTRIBUTED_TRACING_ENABLED
     */
    enabled: true
  },
  /**
   * Logging level. 'trace' is most useful to New Relic when diagnosing
   * issues with the agent, 'info' and higher will impose the least overhead on
   * production applications.
   */
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'info',
    /**
     * Where to put the log file -- by default just uses process.cwd +
     * 'newrelic_agent.log'. A special case is a filepath of 'stdout',
     * in which case all logging will go to stdout, or 'stderr', in which
     * case all logging will go to stderr.
     */
    filepath: 'stdout'
  },
  /**
   * When true, all request headers except for those listed in attributes.exclude
   * will be captured for all traces, unless otherwise specified in a destination's
   * attributes include/exclude lists.
   */
  allow_all_headers: true,
  /**
   * Attributes configuration
   */
  attributes: {
    /**
     * Prefix of attributes to exclude from all destinations. Allows * as wildcard
     * at end.
     *
     * NOTE: If excluding headers, they must be in camelCase form to be filtered.
     */
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  },
  /**
   * AI Monitoring configuration
   */
  ai_monitoring: {
    /**
     * Enables/disables AI monitoring
     */
    enabled: true,
    /**
     * Enables/disables capture of input content
     */
    record_content: {
      enabled: true
    }
  },
  /**
   * Custom events configuration
   */
  custom_insights_events: {
    /**
     * Maximum number of samples stored
     */
    max_samples_stored: 100000
  },
  /**
   * Span events configuration
   */
  span_events: {
    /**
     * Maximum number of samples stored
     */
    max_samples_stored: 10000
  },
  /**
   * Application logging configuration
   */
  application_logging: {
    /**
     * Enables/disables application logging
     */
    enabled: true,
    /**
     * Forwarding configuration
     */
    forwarding: {
      enabled: true,
      max_samples_stored: 10000
    },
    /**
     * Metrics configuration
     */
    metrics: {
      enabled: true
    },
    /**
     * Local decorating configuration
     */
    local_decorating: {
      enabled: true
    }
  }
}

