const Modal = require( '../Modal' ),
  download = require( '../download' )(),
  unzip = require( '../unzip' )(),
  sudo = require( 'sudo-prompt' );

class MonoInstaller {
  constructor( FSOLauncher ) {
    this.FSOLauncher = FSOLauncher;
    this.id = Math.floor( Date.now() / 1000 );
    //this.path = path;
    this.haltProgress = false;
    this.tempPath = `temp/mono-${this.id}.pkg`;
    // todo- change download URL to beta.freeso.org proxy
    this.dl = download( { from: 'https://download.mono-project.com/archive/6.8.0/macos-10-universal/MonoFramework-MDK-6.8.0.105.macos10.xamarin.universal.pkg', to: this.tempPath } );
  }

  createProgressItem( Message, Percentage ) {
    this.FSOLauncher.View.addProgressItem(
      'FSOProgressItem' + this.id,
      'Mono Runtime for Mac',
      'Downloading from mono-project.com',
      Message,
      Percentage
    );
    this.FSOLauncher.setProgressBar(
      Percentage == 100 ? 2 : Percentage / 100
    );
  }

  install() {
    return this.step1()
      .then( () => this.step2() )
      .then( () => this.end() )
      .catch( ErrorMessage => this.error( ErrorMessage ) );
  }

  step1() {
    return this.download();
  }

  step2() {
    return this.extract();
  }

  error( ErrorMessage ) {
    this.dl.cleanup();
    this.FSOLauncher.setProgressBar( 1, {
      mode: 'error'
    } );
    this.haltProgress = true;
    this.createProgressItem( global.locale.FSO_FAILED_INSTALLATION, 100 );
    this.FSOLauncher.View.stopProgressItem( 'FSOProgressItem' + this.id );
    this.FSOLauncher.removeActiveTask( 'Mono' );
    Modal.showFailedInstall( 'Mono', ErrorMessage );
    return Promise.reject( ErrorMessage );
  }

  end() {
    this.dl.cleanup();
    this.FSOLauncher.setProgressBar( -1 );
    this.createProgressItem( global.locale.INSTALLATION_FINISHED, 100 );
    this.FSOLauncher.View.stopProgressItem( 'FSOProgressItem' + this.id );
    this.FSOLauncher.updateInstalledPrograms();
    this.FSOLauncher.removeActiveTask( 'Mono' );
    if(!this.isFullInstall) Modal.showInstalled( 'Mono' );
  }

  download() {
    return new Promise( ( resolve, reject ) => {
      this.dl.run();
      this.dl.events.on( 'error', () => {} );
      this.dl.events.on( 'end', _fileName => {
        if ( this.dl.hasFailed() ) {
          return reject( global.locale.FSO_NETWORK_ERROR );
        }
        resolve();
      } );
      this.updateDownloadProgress();
    } );
  }

  setupDir( dir ) {
    return new Promise( ( resolve, reject ) => {
      require( 'fs-extra' ).ensureDir( dir, err => {
        if ( err ) return reject( err );
        resolve();
      } );
    } );
  }

  updateDownloadProgress() {
    setTimeout( () => {
      const p = this.dl.getProgress(),
        mb = this.dl.getProgressMB(),
        size = this.dl.getSizeMB();

      if ( p < 100 ) {
        if ( !this.haltProgress ) {
          this.createProgressItem(
            `${global.locale.DL_CLIENT_FILES} ${mb} MB ${global.locale.X_OUT_OF_X} ${size} MB (${p}%)`,
            p
          );
        }
        return this.updateDownloadProgress();
      }
    }, 1000 );
  }

  extract() {
    this.createProgressItem(
      'Installing the Mono runtime on your system, please wait...', 100
    );
    return new Promise( ( resolve, reject ) => {
      // headless install
      sudo.exec( `installer -pkg ./temp/mono-${this.id}.pkg -target /`, {}, 
        (err, stdout, stderr) => {
          if( err ) return reject(err);
          console.log('Mono Installer:', stdout, stderr);
          resolve();
      } );
    } );
  }

  cleanup() {
    const fs = require( 'fs-extra' );
    fs.stat( this.tempPath, ( err, _stats ) => {
      if ( err ) {
        return;
      }
      fs.unlink( this.tempPath, function( err ) {
        if ( err ) return console.log( err );
      } );
    } );
  }
}

module.exports = MonoInstaller;