#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>

#import <Firebase.h>
#import <RNBranch/RNBranch.h>
#import <FBSDKCoreKit/FBSDKCoreKit.h>
#import <FBAEMKit/FBAEMKit.h>

#import "Neobank-Swift.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];
  [RNBranch initSessionWithLaunchOptions:launchOptions isReferrable:YES];

  self.moduleName = @"Neobank";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

//  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
//  UIViewController *rootViewController = [UIViewController new];
//  rootViewController.view = rootView;
//  self.window.rootViewController = rootViewController;
//  [self.window makeKeyAndVisible];
//  [SplashScreen.instance showSplash:@"SplashView" inRootView:rootView];

  BOOL result = [super application:application didFinishLaunchingWithOptions:launchOptions];

  UIView* rootView = self.window.rootViewController.view;
  [SplashScreen.instance showSplash:@"SplashView" inRootView:rootView];

  return result;
}

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  NSDictionary *infoPlistDict = [[NSBundle mainBundle] infoDictionary];
  NSString *facebookAppId = infoPlistDict[@"FacebookAppID"];
  [FBAEMReporter configureWithNetworker:nil appID:facebookAppId reporter:nil];
  [FBAEMReporter enable];
  [FBAEMReporter handleURL:url];

  if ([[FBSDKApplicationDelegate sharedInstance] application:app openURL:url options:options]) {
    return YES;
  }

  return [RNBranch application:app openURL:url options:options];
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
  return [RNBranch continueUserActivity:userActivity];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
