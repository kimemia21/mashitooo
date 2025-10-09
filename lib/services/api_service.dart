import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/product.dart';
import '../models/design_project.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3000/api';
  
  // Create a new design project
  Future<DesignProject> createProject({
    String modelType = 'tshirt',
    String baseColor = '#ffffff',
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/project/create'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'modelType': modelType,
          'baseColor': baseColor,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return DesignProject.fromJson(data['project']);
      } else {
        throw Exception('Failed to create project: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Get project details
  Future<DesignProject> getProject(String projectId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/project/$projectId'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return DesignProject.fromJson(data['project']);
      } else {
        throw Exception('Failed to get project: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Upload a sticker file
  Future<Map<String, dynamic>> uploadSticker(File stickerFile) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/sticker/upload'),
      );
      
      request.files.add(await http.MultipartFile.fromPath(
        'sticker',
        stickerFile.path,
      ));

      var response = await request.send();
      var responseData = await response.stream.bytesToString();

      if (response.statusCode == 200) {
        return jsonDecode(responseData);
      } else {
        throw Exception('Failed to upload sticker: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Upload error: $e');
    }
  }

  // Add sticker to project
  Future<DesignElement> addSticker({
    required String projectId,
    required String stickerId,
    required String stickerUrl,
    required double x,
    required double y,
    required double width,
    required double height,
    double rotation = 0,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/project/$projectId/sticker'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'stickerId': stickerId,
          'stickerUrl': stickerUrl,
          'x': x,
          'y': y,
          'width': width,
          'height': height,
          'rotation': rotation,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return DesignElement.fromJson(data['element']);
      } else {
        throw Exception('Failed to add sticker: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Add text to project
  Future<DesignElement> addText({
    required String projectId,
    required String text,
    required double x,
    required double y,
    int fontSize = 48,
    String fontFamily = 'Arial',
    String color = '#000000',
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/project/$projectId/text'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'text': text,
          'x': x,
          'y': y,
          'fontSize': fontSize,
          'fontFamily': fontFamily,
          'color': color,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return DesignElement.fromJson(data['element']);
      } else {
        throw Exception('Failed to add text: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Update project color
  Future<void> updateColor({
    required String projectId,
    required String color,
  }) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/project/$projectId/color'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'color': color}),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to update color: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Render final texture
  Future<RenderResult> renderTexture({
    required String projectId,
    int width = 2048,
    int height = 2048,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/project/$projectId/render'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'width': width,
          'height': height,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return RenderResult(
          projectId: projectId,
          textureUrl: data['textureUrl'],
          width: data['width'],
          height: data['height'],
          createdAt: DateTime.now(),
        );
      } else {
        throw Exception('Failed to render texture: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Get available models
  Future<List<Product>> getAvailableModels() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/models'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final modelsData = data['models'] as List;
        
        return modelsData.map((model) => Product(
          id: model['productType'],
          name: model['name'],
          type: model['productType'],
          modelUrl: '/assets/${model['filename']}',
          thumbnailUrl: '', // You can add thumbnails later
          basePrice: 29.99, // Default price
        )).toList();
      } else {
        throw Exception('Failed to get models: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
}