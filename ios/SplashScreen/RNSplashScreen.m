//
//  RNSplashScreen.m
//  Neobank
//
//  Created by Ihor on 18.07.22.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

#import "Neobank-Swift.h"

#import "RNSplashScreen.h"

@implementation RNSplashScreen
RCT_EXPORT_MODULE(RNSplashScreen)

- (instancetype)init {
  SplashScreen.instance.emitter = self;

  return [super init];
}

RCT_EXPORT_METHOD(hide) {
  [SplashScreen.instance hide];
}

RCT_EXPORT_METHOD(show) {
  [SplashScreen.instance show];
}

RCT_EXPORT_METHOD(isReady:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  [SplashScreen.instance isReady:resolve rejecter:reject];
}

+ (BOOL)requiresMainQueueSetup {
  return FALSE;
}

- (dispatch_queue_t)methodQueue{
    return dispatch_get_main_queue();
}

- (NSArray<NSString *> *)supportedEvents {
  return @[SplashScreen.SplashAnimationEndEvent];
}

- (void)invalidate {
  [super invalidate];
  SplashScreen.instance.emitter = self;
}

-(void)startObserving {}

-(void)stopObserving {}

@end
