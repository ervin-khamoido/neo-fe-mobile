package co.neobank.app;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;

public class BuildInfoModule extends ReactContextBaseJavaModule {
    BuildInfoModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return BuildInfoModule.class.getSimpleName();
    }

    @ReactMethod
    public void getAll(Promise promise) throws IllegalAccessException {
        WritableMap map = Arguments.createMap();

        for(Field f: BuildConfig.class.getFields()) {
            if(Modifier.isStatic(f.getModifiers())) {
                if(f.getType() == int.class || f.getType() == Integer.class) {
                    map.putInt(f.getName(), f.getInt(null));
                } else if(f.getType() == boolean.class || f.getType() == Boolean.class) {
                    map.putBoolean(f.getName(), f.getBoolean(null));
                } else if(f.getType() == String.class) {
                    map.putString(f.getName(), (String) f.get(null));
                }
                // TODO: other types
            }
        }

        promise.resolve(map);
    }
}
