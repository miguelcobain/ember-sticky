import Token from './cancellation-token';

function job(cb, token) {
  return function execJob() {
    if (token.cancelled === false) {
      cb();
    }
  };
}

export class Scheduler {
  constructor(runner) {
    this.sync = [];
    this.layout = [];
    this.measure = [];
    this.affect = [];
    this._nextFlush = null;
    this._runner = runner;
  }

  schedule(queueName, cb, parent) {
    let token = new Token(parent);

    this[queueName].push(job(cb, token));
    this._flush();

    return token;
  }

  forget(token) {
    if (token) {
      token.cancel();
    }
  }

  _flush() {
    if (this._nextFlush !== null) {
      return;
    }

    this._nextFlush = requestAnimationFrame(() => {
      this._nextFlush = null;
      this.flush();
    });
  }

  flush() {
    let i;
    let q;

    if (this._runner) {
      this._runner.begin();
    }
    if (this.sync.length) {
      q = this.sync;
      this.sync = [];

      for (i = 0; i < q.length; i++) {
        q[i]();
      }
    }

    if (this.layout.length) {
      q = this.layout;
      this.layout = [];

      for (i = 0; i < q.length; i++) {
        q[i]();
      }
    }

    if (this._runner) {
      this._runner.end();
      this._runner.begin();
    }

    if (this.measure.length) {
      q = this.measure;
      this.measure = [];

      for (i = 0; i < q.length; i++) {
        q[i]();
      }
    }

    if (this.affect.length) {
      q = this.affect;
      this.affect = [];

      for (i = 0; i < q.length; i++) {
        q[i]();
      }
    }
    if (this._runner) {
      this._runner.end();
    }
  }
}

export default new Scheduler();