//
//  SplashScreen.swift
//  Neobank
//
//  Created by Ihor on 18.07.22.
//

import Foundation
import UIKit
import React
import Lottie

@objc(SplashScreen)
class SplashScreen: NSObject {
  @objc private(set) static var instance: SplashScreen = SplashScreen()

  @objc static let SplashAnimationEndEvent = "splash_animation_end";

  private var waiting: Bool = true;
  private var addedJsLoadErrorObserver: Bool = false;
  private var loadingView: UIView? = nil;
  @objc private(set) var ready: Bool = false;

  @objc var emitter: RCTEventEmitter? = nil

  @objc(show)
  func show() -> Void {
    if (!addedJsLoadErrorObserver) {
      NotificationCenter.default.addObserver(Self.self, selector: #selector(self.jsLoadError), name: NSNotification.Name.RCTJavaScriptDidFailToLoad, object: nil);
      addedJsLoadErrorObserver = true;

    }

    while (waiting) {
     let later = Date.init(timeIntervalSinceNow: 0.1);
     RunLoop.main.run(until: later);
    }
  }

// Lottie Splash Screen
//  @objc(showSplash:inRootView:)
//  func showSplash(_ splashScreen: String, inRootView rootView: UIView) {
//    if(loadingView == nil) {
//      let animatedView = AnimationView.init(name: "splash_new")
//      animatedView.frame = rootView.frame;
//      animatedView.contentMode = .scaleAspectFill
//      animatedView.play { value in
//        self.ready = true;
//        self.emitter?.sendEvent(withName: SplashScreen.SplashAnimationEndEvent, body: nil);
//      };
//
//      loadingView = animatedView;
//    }
//
//    waiting = false;
//
//    rootView.addSubview(loadingView!);
//
//  }

  @objc(showSplash:inRootView:)
  func showSplash(_ splashScreen: String, inRootView rootView: UIView) {
    if(loadingView == nil) {
      let animatedView = self.loadNib(splashScreen)
      animatedView.frame = rootView.frame;
      animatedView.contentMode = .scaleToFill

      loadingView = animatedView;

      self.ready = true
      self.emitter?.sendEvent(withName: SplashScreen.SplashAnimationEndEvent, body: nil);
    }

    waiting = false;

    rootView.addSubview(loadingView!);

  }

  func loadNib(_ xibName: String) -> UIView {
      let bundle = Bundle(for: Self.self)
      return bundle.loadNibNamed(xibName, owner: self, options: nil)?.first as! UIView
  }

  @objc(hide)
  func hide() -> Void {
    if (waiting) {
      DispatchQueue.main.async { self.waiting = false }
    } else {
      let triggerAfterNS = DispatchTime.now().uptimeNanoseconds + NSEC_PER_SEC / 10;

      DispatchQueue.main.asyncAfter(deadline: DispatchTime.init(uptimeNanoseconds: triggerAfterNS)) {
        self.loadingView?.perform(#selector(self.loadingView!.removeFromSuperview), with: nil, afterDelay: 1.5);
        UIView.animate(withDuration: 0.3, animations: { self.loadingView!.layer.opacity = 0 });
      }
    }
  }

  @objc(jsLoadError:)
  func jsLoadError(_ notification: NSNotification) {
    self.hide();
  }

  @objc(isReady:rejecter:)
  func isReady(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    resolve(ready);
  }

}

