import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/design_controller.dart';
import 'screens/product_catalog_screen.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => DesignController(),
      child: MaterialApp(
        title: '3D Product Customization Platform',
        theme: ThemeData(
          primarySwatch: Colors.blue,
          visualDensity: VisualDensity.adaptivePlatformDensity,
          useMaterial3: true,
        ),
        home: const ProductCatalogScreen(),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}