'use strict';

const Model = require('../../lib/params');

module.exports = options => {
  return async function parameters(ctx, next) {
    const params = ctx.params || {};
    for (const key in ctx.query) {
      if (!(key in params)) params[key] = ctx.query[key];
    }

    for (const key in ctx.request.body) {
      if (key === '_csrf' || key === '_method') continue;
      if (!(key in params)) params[key] = ctx.request.body[key];
    }

    ctx.params = new Model(params);
    if (options.logParameters) {
      const filterParameters = options.filterParameters || [];
      const printParams = {};
      for (const k in params) {
        if (filterParameters.includes(k)) {
          const type = typeof params[k];
          const length = type === 'string' ? ` ${params[k].length}` : '';
          printParams[k] = `<${type}${length}>`;
          continue;
        }
        printParams[k] = params[k];
      }
      ctx.coreLogger.info('[parameters] %j, content-type: %j', printParams, ctx.get('content-type'));
    }

    await next();
  };
};
