import os

def generate_markdown(directory, level=0):
    markdown = ""
    indent = "  " * level  # Two spaces for each level of indentation

    with os.scandir(directory) as entries:
        for entry in entries:
            if entry.is_dir(follow_symlinks=False):
                markdown += f"{indent}- **{entry.name}/**\n"
                markdown += generate_markdown(entry.path, level + 1)
            else:
                markdown += f"{indent}- {entry.name}\n"

    return markdown

if __name__ == "__main__":
    current_directory = os.getcwd()
    current_dir_name = os.path.basename(current_directory)
    
    # Start with the current directory
    markdown_structure = f"- **{current_dir_name}/**\n"
    markdown_structure += generate_markdown(current_directory, level=1)

    # Print the markdown structure
    print(markdown_structure)
    
    # # Save to a file
    # with open("directory_structure.md", "w") as f:
    #     f.write(markdown_structure)

    # print("Markdown structure saved to directory_structure.md")
