import 'package:flutter/material.dart';
import 'package:flutter_project/service/observer-service.dart';
import 'package:provider/provider.dart';

import '../../classes/applocalization.dart';

class InteractionMenu extends StatefulWidget {
  final List<String> targetPlayerNames;
  InteractionMenu({super.key, required List<String> playerNames})
      : targetPlayerNames = new List.from(['all'])..addAll(playerNames);

  @override
  State<InteractionMenu> createState() => _InteractionMenuState();
}

class _InteractionMenuState extends State<InteractionMenu> {
  @override
  Widget build(BuildContext context) {
    final observerService = Provider.of<ObserverService>(context);
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;

    return Container(
      decoration: const BoxDecoration(
        color: Color.fromARGB(255, 198, 154, 52),
        borderRadius: BorderRadius.only(
            topLeft: Radius.circular(20), bottomLeft: Radius.circular(20)),
      ),
      child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Stack(children: [
            Visibility(
                maintainState: true,
                visible: observerService.state == InteractionState.Initial,
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                         Text(
                             appLocalizations.translate('INTERACT_WITH') ?? '',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            )),
                        SizedBox(width: 10),
                        DropdownButtonExample(list: widget.targetPlayerNames),
                      ],
                    ),
                    SizedBox(height: 5),
                    Stack(
                      alignment: Alignment.bottomCenter,
                      children: [
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Color.fromARGB(255, 208, 118, 1),
                            shape: const RoundedRectangleBorder(
                              borderRadius: BorderRadius.zero,
                            ),
                            fixedSize: Size(220, 45),
                          ),
                          onPressed: () {
                            observerService.startInteraction();
                          },
                          child:  Align(
                            alignment: Alignment.center,
                            child: Text(
                                appLocalizations.translate('START_INTERACTION') ?? '',
                                style: TextStyle(
                                    color: Colors.white, fontSize: 14),
                                textAlign: TextAlign.center),
                          ),
                        ),
                        Positioned(
                          top: 1,
                          child: Image.asset(
                            'assets/push_pin.png',
                            width: 15,
                            height: 15,
                          ),
                        ),
                      ],
                    ),
                  ],
                )),
            if (observerService.state == InteractionState.Started)
               SizedBox(
                height: 125,
                child: Padding(
                  padding: const EdgeInsets.all(10.0),
                  child: Align(
                    alignment: Alignment.center,
                    child: Text(
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.white, fontSize: 14),
                      appLocalizations.translate('CLICK_AND_DRAG') ?? ''),
                  ),
                ),
              ),
            if (observerService.state == InteractionState.Waiting)
               SizedBox(
                height: 125,
                child: Padding(
                  padding: EdgeInsets.only(left: 10, right: 10),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                          width: 25,
                          height: 25,
                          child: Center(
                              child: CircularProgressIndicator(
                                  color: Colors.amber))),
                      SizedBox(height: 10),
                      Text(
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.white, fontSize: 14),
                          appLocalizations.translate('INTERACTION_SENT') ?? ''),

                    ],
                  ),
                ),
              ),
          ])),
    );
  }
}

class DropdownButtonExample extends StatefulWidget {
  final List<String> list;
  DropdownButtonExample({Key? key, required this.list}) : super(key: key);

  @override
  State<DropdownButtonExample> createState() => _DropdownButtonExampleState();
}

class _DropdownButtonExampleState extends State<DropdownButtonExample> {
  String dropdownValue = 'all';

  @override
  Widget build(BuildContext context) {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;

    return Theme(
      data: Theme.of(context).copyWith(
        canvasColor: Color.fromARGB(255, 198, 154, 52),
      ),
      child: DropdownButton<String>(
        value: dropdownValue,
        icon: const Icon(
          Icons.arrow_downward,
          color: Colors.white60,
        ),
        elevation: 16,
        style: const TextStyle(color: Colors.white),
        underline: Container(
          height: 2,
          color: Color.fromARGB(255, 208, 118, 1),
        ),
        onChanged: (String? value) {
          if (value != null) ObserverService.instance.targetPlayerName = value;
          setState(() {
            dropdownValue = value!;
          });
        },
        items: widget.list.map<DropdownMenuItem<String>>((String value) {
          return DropdownMenuItem<String>(
            value: value,
            child: value == 'all' ? Text(appLocalizations.translate('EVEREYONE') ?? '',
            ) : Text(value),
          );
        }).toList(),
      ),
    );
  }
}
