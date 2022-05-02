import sys
import contentful_management

from env import *

client = contentful_management.Client(MANAGEMENT_API_TOKEN)
space = client.spaces().find(SPACE_ID)

environment = space.environments().find('master')
content_types = environment.content_types().all()
content_type = content_types[0]

if '--test' in sys.argv:
    # Test by getting entries and showing local image locations
    print('Testing...')
    print('Your formation index file is set to: ' + FORMATION_INDEX)
    print('Your formation image file directory is set to: ' + FORMATION_IMAGE_DIR)
    entries = content_type.entries().all()

    sys.exit()

if '--delete-all' in sys.argv:
    # Delete all entries
    entries = content_type.entries().all()
    for entry in entries:
        if entry.is_published:
            entry.unpublish()
        environment.entries().delete(entry.id)

    # Delete all assets
    assets = environment.assets().all()
    for asset in assets:
        if asset.is_published:
            asset.unpublish()
        environment.assets().delete(asset.id)

    sys.exit()

with open(FORMATION_INDEX, 'r') as formation_file:
    for line in formation_file:
        formation_code, formation_name = line.strip().split(None, 1)
        formation_size = int(formation_code.split('-')[0])
        formation_filename = formation_code + '.png'

        print(formation_code, formation_name)

        # Create a new upload to get the image into Contentful
        upload = space.uploads().create(FORMATION_IMAGE_DIR + '/' + formation_filename)

        # Associate an asset with the uploaded image
        new_asset = environment.assets().create(
            None,
            {
                'fields': {
                    'title': {
                        'en-US': formation_code + ': ' + formation_name
                    },
                    'file': {
                        'en-US': {
                            'fileName': formation_filename,
                            'contentType': 'image/png',
                            'uploadFrom': upload.to_link().to_json()
                        }
                    }
                }
            }
        )

        # Process the asset
        new_asset.process()

        # Wait for the asset processing to be complete
        while True:
            processed_asset = environment.assets().find(new_asset.id)
            try:
                if 'url' in processed_asset.file:
                    break
            except:
                continue

        # And then publish
        processed_asset.publish()

        # Add an entry that references the asset
        entry_attributes = {
            'content_type_id': content_type.id,
            'fields': {
                'name': {
                    'en-US': formation_name
                },
                'code': {
                    'en-US': formation_code
                },
                'size': {
                    'en-US': formation_size
                },
                'diagram': {
                    'en-US': {
                        'sys': {
                            'type': 'Link',
                            'linkType': 'Asset',
                            'id': processed_asset.id
                        }
                    }
                }
            }
        }

        new_entry = environment.entries().create(
            None,
            entry_attributes
        )

        new_entry.publish()
