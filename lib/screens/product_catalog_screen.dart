import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/design_controller.dart';
import '../models/product.dart';
import 'design_editor_screen.dart';

class ProductCatalogScreen extends StatefulWidget {
  const ProductCatalogScreen({super.key});

  @override
  State<ProductCatalogScreen> createState() => _ProductCatalogScreenState();
}

class _ProductCatalogScreenState extends State<ProductCatalogScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('3D Product Customization'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        elevation: 0,
      ),
      body: Consumer<DesignController>(
        builder: (context, controller, child) {
          if (controller.isLoading) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Loading products...'),
                ],
              ),
            );
          }

          if (controller.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline,
                    size: 64,
                    color: Colors.red[300],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Error loading products',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Text(
                      controller.error!,
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => controller.clearError(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          if (controller.availableProducts.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.inventory_2_outlined,
                    size: 64,
                    color: Colors.grey,
                  ),
                  SizedBox(height: 16),
                  Text('No products available'),
                  SizedBox(height: 8),
                  Text(
                    'Please add some .glb models to the server/assets folder',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            );
          }

          return Column(
            children: [
              // Connection status indicator
              if (controller.connectionStatus != null)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(8),
                  color: _getStatusColor(controller.connectionStatus!),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        _getStatusIcon(controller.connectionStatus!),
                        size: 16,
                        color: Colors.white,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Server ${controller.connectionStatus}',
                        style: const TextStyle(color: Colors.white),
                      ),
                    ],
                  ),
                ),
              
              // Product grid
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: GridView.builder(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 0.75,
                    ),
                    itemCount: controller.availableProducts.length,
                    itemBuilder: (context, index) {
                      final product = controller.availableProducts[index];
                      return ProductCard(
                        product: product,
                        onTap: () => _startCustomization(context, product, controller),
                      );
                    },
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'connected':
        return Colors.green;
      case 'connecting':
        return Colors.orange;
      case 'disconnected':
      case 'error':
      case 'failed':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'connected':
        return Icons.wifi;
      case 'connecting':
        return Icons.wifi_find;
      case 'disconnected':
      case 'error':
      case 'failed':
        return Icons.wifi_off;
      default:
        return Icons.help_outline;
    }
  }

  Future<void> _startCustomization(
    BuildContext context,
    Product product,
    DesignController controller,
  ) async {
    // Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const AlertDialog(
        content: Row(
          children: [
            CircularProgressIndicator(),
            SizedBox(width: 16),
            Text('Creating project...'),
          ],
        ),
      ),
    );

    try {
      await controller.createProject(
        modelType: product.type,
        baseColor: '#ffffff',
      );

      if (context.mounted) {
        Navigator.of(context).pop(); // Close loading dialog
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => DesignEditorScreen(product: product),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        Navigator.of(context).pop(); // Close loading dialog
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to start customization: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}

class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback onTap;

  const ProductCard({
    super.key,
    required this.product,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Product preview (placeholder for now)
            Expanded(
              flex: 3,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.blue[50]!,
                      Colors.blue[100]!,
                    ],
                  ),
                ),
                child: Icon(
                  _getProductIcon(product.type),
                  size: 64,
                  color: Colors.blue[400],
                ),
              ),
            ),
            
            // Product info
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _formatProductName(product.name),
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatProductType(product.type),
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey[600],
                      ),
                    ),
                    const Spacer(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '\$${product.basePrice.toStringAsFixed(2)}',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: Colors.green[700],
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const Icon(
                          Icons.arrow_forward_ios,
                          size: 16,
                          color: Colors.grey,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getProductIcon(String type) {
    switch (type.toLowerCase()) {
      case 'tshirt':
      case 't-shirt':
        return Icons.checkroom;
      case 'hoodie':
        return Icons.dry_cleaning;
      case 'mug':
      case 'cup':
        return Icons.coffee;
      case 'cap':
      case 'hat':
        return Icons.sports_baseball;
      default:
        return Icons.category;
    }
  }

  String _formatProductName(String name) {
    return name.replaceAllMapped(RegExp(r'(?=[A-Z])'), (match) => ' ').trim().toUpperCase();
  }

  String _formatProductType(String type) {
    return type.substring(0, 1).toUpperCase() + type.substring(1);
  }
}