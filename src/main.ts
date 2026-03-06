import 'zone.js'; // ← must be first import
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

// ─── FIX: main.ts was bootstrapping with its own inline providers instead of
//          appConfig. This meant everything in app.config.ts (including the
//          authInterceptor) was completely ignored. All providers now live in
//          app.config.ts — main.ts just references it.
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
