package co.neobank.app;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

import io.branch.rnbranch.RNBranchModule;
import co.neobank.app.splashscreen.SplashScreen;

import android.content.Intent;
import android.os.Bundle;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Neobank";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
            this,
            getMainComponentName(),
            // If you opted-in for the New Architecture, we enable the Fabric Renderer.
            DefaultNewArchitectureEntryPoint.getFabricEnabled()
    );
  }

  @Override
  protected void onStart() {
    super.onStart();

    final Intent intent = getIntent();

    // https://github.com/BranchMetrics/android-branch-deep-linking-attribution/issues/808#issuecomment-747802550
    intent.putExtra("branch_force_new_session", true);
    RNBranchModule.initSession(intent.getData(), this);
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    this.initializeSplashScreen();

    // https://neobank.atlassian.net/browse/NEOBANK-932
    if (savedInstanceState != null) {
        savedInstanceState.remove("android:support:fragments");
        savedInstanceState.remove("android:fragments");
    }
    super.onCreate(savedInstanceState);
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
     if (intent != null
             && intent.hasExtra("branch_force_new_session")
             && intent.getBooleanExtra("branch_force_new_session",false)
     ) {
        RNBranchModule.onNewIntent(intent);
     }
  }

  private void initializeSplashScreen() {
      SplashScreen.show(this);
      SplashScreen.setReady(true);

      // LottieAnimationView animatedView = (LottieAnimationView) SplashScreen.getSplashDialog().findViewById(R.id.animation_view);
      // FIXES: https://neobank.atlassian.net/browse/NEOBANK-978
//      animatedView.addValueCallback(
//              new KeyPath("Save Money with Digital Dollars"),
//              LottieProperty.TRANSFORM_ANCHOR_POINT,
//              new LottieRelativePointValueCallback(new PointF(0f, -100f))
//      );
      //

//      Animator.AnimatorListener listener = new Animator.AnimatorListener() {
//          @Override
//          public void onAnimationStart(Animator animation) {
//          }
//
//          @Override
//          public void onAnimationEnd(Animator animation) {
//              animatedView.removeAllAnimatorListeners();
//
//              ReactContext reactContext = getReactInstanceManager().getCurrentReactContext();
//
//              if(reactContext != null) {
//                  reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
//                          .emit("splash_animation_end", null);
//              }
//
//              SplashScreen.setReady(true);
//          }
//
//          @Override
//          public void onAnimationCancel(Animator animation) { }
//
//          @Override
//          public void onAnimationRepeat(Animator animation) { }
//      };
//
//      animatedView.addAnimatorListener(listener);
  }
}
