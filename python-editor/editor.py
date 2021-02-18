# Functions in this module simulate what an editor plugin might do. For real-world examples,
# see https://github.com/serenadeai/code and https://github.com/serenadeai/atom.


def get_editor_state(limited):
    filename = "file.py"
    if limited:
        return {
            "filename": filename,
        }

    return {"source": "print('hello world!')\n", "cursor": 3, "filename": filename}


def next_tab():
    print("Switching to the next tab!")


def previous_tab():
    print("Switching to the previous tab!")


def set_cursor(cursor):
    print(f"Setting editor cursor position to: {cursor}")


def set_source(source):
    print(f"Setting editor source to:\n{source}")
