import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_project/dtos/channel-dto.dart';
import 'package:flutter_project/service/settings-service.dart';
import 'package:giphy_api_client/giphy_api_client.dart';
import 'package:http/http.dart' as http;

class GifWidget extends StatefulWidget {
  const GifWidget({Key? key}) : super(key: key);

  @override
  _GifWidgetState createState() => _GifWidgetState();
}

// const GIF_TOKEN = '2hrYZpXsFvTv1EPYYz8sdKKWvmaAITPL';
class _GifWidgetState extends State<GifWidget> {
  List<String> _gifUrls = [];
  final String apiKey = '2hrYZpXsFvTv1EPYYz8sdKKWvmaAITPL';
  final client = new GiphyClient(apiKey: '2hrYZpXsFvTv1EPYYz8sdKKWvmaAITPL');
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadInitialGifs();
  }

  void _loadInitialGifs() async {
    try {
      var url = Uri.parse(
          'https://api.giphy.com/v1/gifs/search?q=trending&api_key=$apiKey&limit=50');
      var response = await http.get(url);
      var jsonResponse = json.decode(response.body);
      var data = jsonResponse['data'] as List;

      setState(() {
        // Mappe chaque GIF à son URL et stocke les URLs dans _gifUrls.
        _gifUrls = data
            .map((gif) => gif['images']['fixed_height']['url'].toString())
            .toList();
      });
    } catch (e) {
      print('Erreur lors du chargement des GIFs tendances: $e');
    }
  }

  void _searchGifs(String gifName) async {
    var url = Uri.parse(
        'https://api.giphy.com/v1/gifs/search?q=$gifName&api_key=$apiKey&limit=50');
    var response = await http.get(url);

    if (response.statusCode == 200) {
      var jsonResponse = json.decode(response.body);
      var data = jsonResponse['data'] as List;

      setState(() {
        _gifUrls = data
            .map((gif) => gif['images']['fixed_height']['url'].toString())
            .toList();
      });
    } else {
      print('Failed to load GIFs');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('GIFs'),
      ),
      body: Column(
        children: [
          // Padding(
          //   padding: const EdgeInsets.all(8.0),
          //   child: TextField(
          //     controller: _searchController,
          //     decoration: InputDecoration(
          //       labelText: 'Search for a GIF',
          //       suffixIcon: IconButton(
          //         icon: Icon(Icons.search),
          //         onPressed: () => _searchGifs(_searchController.text),
          //       ),
          //     ),
          //   ),
          // ),
          Expanded(
            child: GridView.builder(
              gridDelegate:
                  SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3),
              itemCount: _gifUrls.length,
              itemBuilder: (context, index) {
                return InkWell(
                  onTap: () {
                    Navigator.pop(context, _gifUrls[index]);
                  },
                  child: Image.network(_gifUrls[index], fit: BoxFit.cover),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
