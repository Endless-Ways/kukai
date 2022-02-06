import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BeaconService } from '../../../services/beacon/beacon.service';
import QrScanner from 'qr-scanner';
import { DeeplinkService } from '../../../services/deeplink/deeplink.service';
import { CONSTANTS as _CONSTANTS, environment } from '../../../../environments/environment';
import { MessageService } from '../../../services/message/message.service';
import { ModalComponent } from '../modal.component';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['../../../../scss/components/modals/modal.scss']
})
export class QrScannerComponent extends ModalComponent implements OnInit {
  readonly CONSTANTS = _CONSTANTS;
  readonly env = environment;
  constructor(private beaconService: BeaconService, private deeplinkService: DeeplinkService, private messageService: MessageService) {
    super();
  }
  @ViewChild('videoPlayer') videoplayer: ElementRef;
  qrScanner: QrScanner;
  manualInput = '';
  name = 'qr-scanner';
  loadingCam = false;
  ngOnInit(): void {}
  openModal(): void {
    ModalComponent.currentModel.next({ name: this.name, data: null });
    this.scan();
  }
  async scan(): Promise<void> {
    this.loadingCam = true;
    const hasCamera = await QrScanner.hasCamera();
    if (hasCamera) {
      QrScanner.WORKER_PATH = './assets/js/qr-scanner-worker.min.js';
      this.qrScanner = new QrScanner(this.videoplayer.nativeElement, (result) => this.handleQrCode(result));
      await this.qrScanner.start();
      if (!this.isOpen) {
        this.qrScanner.stop();
        this.qrScanner.destroy();
        this.qrScanner = null;
      }
    } else {
      console.warn('no camera found');
    }
    this.loadingCam = false;
  }
  handleQrCode(pairInfo: string): void {
    console.log('Pairing Info', pairInfo);
    const pairingInfo = this.deeplinkService.QRtoPairingJson(pairInfo);
    if (pairingInfo) {
      this.beaconService.preNotifyPairing(pairingInfo);
      this.beaconService.addPeer(pairingInfo);
    }
    this.closeModal();
  }
  handlePaste(ev: ClipboardEvent): void {
    if (!this.env.production) {
      const pairingString = ev?.clipboardData?.getData('text');
      const pairingInfo = pairingString ? this.deeplinkService.QRtoPairingJson(pairingString) : '';
      if (pairingInfo) {
        this.beaconService.preNotifyPairing(pairingInfo);
        this.beaconService.addPeer(pairingInfo);
        this.closeModal();
      } else {
        this.messageService.addError('Invalid Base58 checksum!');
      }
    }
  }
  closeModal(): void {
    // restore body scrollbar
    if (this.qrScanner && !this.loadingCam) {
      this.qrScanner.stop();
      this.qrScanner.destroy();
      this.qrScanner = null;
    }
    ModalComponent.currentModel.next({ name: '', data: null });
    this.manualInput = '';
  }
}
